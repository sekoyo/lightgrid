import type {
  ColumnOrGroup,
  ColumnPin,
  DerivedColumnOrGroup,
  GroupedColumns,
  ItemId,
} from '../types'
import {
  findColumnOrGroupByKey,
  flatMapColumns,
  isColumnGroup,
  updateColumn,
  throttle,
} from '../utils'
import { GridPlugin } from '../GridPlugin'

export type SetColReorderKey = (colReorderKey: ItemId | undefined) => void

enum DragIcon {
  NotAllowed,
  Move,
  Pin,
}

enum PointerSide {
  None,
  Left,
  Right,
}

export class ColumnReorderPlugin<T, N> extends GridPlugin<T, N> {
  colToMove?: ColumnOrGroup<T, N>
  colToMoveChildKeys: ItemId[] = []
  lastOverColumnKey?: ItemId
  lastPointerSide = PointerSide.None
  lastPin?: ColumnPin
  dragLabel = new DragLabel()

  unmount() {
    this.offWindowPointerEvents()
    this.checkShouldMoveColumnThrottled.cancel()
    this.checkBoundsActions.cancel()
  }

  onWindowPointerEvents() {
    window.addEventListener('pointermove', this.onWindowPointerMove)
    window.addEventListener('pointerup', this.onWindowPointerUp)
  }

  offWindowPointerEvents() {
    window.removeEventListener('pointermove', this.onWindowPointerMove)
    window.removeEventListener('pointerup', this.onWindowPointerUp)
  }

  onWindowPointerMove = (e: PointerEvent) => {
    if (this.dragLabel.el) {
      const clampedX = Math.max(
        0,
        Math.min(e.clientX, window.innerWidth - this.dragLabel.width)
      )
      const clampedY = Math.max(
        0,
        Math.min(e.clientY, window.innerHeight - this.dragLabel.height)
      )
      this.dragLabel.el.style.setProperty('left', `${clampedX}px`)
      this.dragLabel.el.style.setProperty('top', `${clampedY}px`)
    }
    this.checkBoundsActions(e.clientX, e.clientY)
  }

  onWindowPointerUp = () => {
    this.offWindowPointerEvents()
    this.mgr.setColReorderKey(undefined)
    this.dragLabel.unmount()
    this.lastOverColumnKey = undefined
    this.lastPointerSide = PointerSide.None
    this.colToMoveChildKeys = []
  }

  onPointerDown = (e: PointerEvent, column: DerivedColumnOrGroup<T, N>) => {
    if (!this.mgr.onColumnsChange) {
      console.error(
        'onColumnsChange prop is required to enable column reordering'
      )
      return
    }

    if (!(e.target instanceof HTMLElement)) {
      return
    }

    this.colToMove = findColumnOrGroupByKey(this.mgr.$columns.value, column.key)

    if (!this.colToMove) {
      return
    }

    this.lastPin = column.pin

    if (isColumnGroup(this.colToMove)) {
      this.colToMoveChildKeys = flatMapColumns(
        this.colToMove.children,
        c => c.key
      )
    }

    this.mgr.setColReorderKey(column.key)
    this.onWindowPointerEvents()
    this.dragLabel.mount(
      e.target.textContent || String(column.key),
      DragIcon.Move
    )
  }

  // In react at least, e.nativeEvent.target/currentTarget is wrong :/
  // so just require el and clientX directly.
  onPointerEnter = (
    el: Element,
    clientX: number,
    overColumn: DerivedColumnOrGroup<T, N>
  ) => {
    this.checkShouldMoveColumn(el, clientX, overColumn)
  }

  onPointerMove = (
    el: Element,
    clientX: number,
    overColumn: DerivedColumnOrGroup<T, N>
  ) => {
    this.checkShouldMoveColumnThrottled(el, clientX, overColumn)
  }

  checkShouldMoveColumn = (
    el: Element,
    clientX: number,
    overColumn: DerivedColumnOrGroup<T, N>
  ) => {
    if (
      this.colToMove &&
      this.colToMove.key !== overColumn.key &&
      !this.colToMoveChildKeys.includes(overColumn.key)
    ) {
      // What side is it on?
      const rect = el.getBoundingClientRect()
      const localX = clientX - rect.left
      const pointerSide =
        localX < overColumn.size / 2 ? PointerSide.Left : PointerSide.Right

      if (
        this.lastOverColumnKey === overColumn.key &&
        this.lastPointerSide === pointerSide
      ) {
        return
      }

      // If it's the same overColumn and side, ignore it to stop
      // swapping in a loop
      this.lastOverColumnKey = overColumn.key
      this.lastPointerSide = pointerSide

      const nextColumns = this.moveColumn(
        this.mgr.$columns.value,
        this.colToMove,
        overColumn.key,
        pointerSide
      )

      this.mgr.onColumnsChange?.(nextColumns)
    }
  }

  checkShouldMoveColumnThrottled = throttle(this.checkShouldMoveColumn, 100)

  moveColumn(
    columns: GroupedColumns<T, N>,
    colToMove: ColumnOrGroup<T, N>,
    adjacentColKey: ItemId,
    pointerSide: PointerSide
  ): GroupedColumns<T, N> {
    return columns.reduce(
      (nextCols, _col) => {
        let col = _col
        if (colToMove.key === col.key) {
          // Filter out the column to move
          return nextCols
        }

        if (adjacentColKey === col.key) {
          const colToMoveCopy = Object.assign({}, colToMove)
          colToMoveCopy.pin = col.pin

          if (isColumnGroup(colToMoveCopy)) {
            // When columns are re-derived the pin of the parent will be inherited
            colToMoveCopy.children = this.removePinFromChildren(
              colToMoveCopy.children
            )
          }

          // If the adjacent col was a group, we may need to filter out the moved col from it
          // in the case of moving to another location in the same group
          if (isColumnGroup(col)) {
            col = Object.assign({}, col)
            col.children = this.moveColumn(
              col.children,
              colToMove,
              adjacentColKey,
              pointerSide
            )
          }

          if (pointerSide === PointerSide.Left) {
            nextCols.push(colToMoveCopy)
            nextCols.push(col)
          } else {
            nextCols.push(col)
            nextCols.push(colToMoveCopy)
          }
        } else if (isColumnGroup(col)) {
          const colToMoveCopy = Object.assign({}, col)
          colToMoveCopy.children = this.moveColumn(
            col.children,
            colToMove,
            adjacentColKey,
            pointerSide
          )
          nextCols.push(colToMoveCopy)
        } else {
          nextCols.push(col)
        }

        return nextCols
      },
      [] as GroupedColumns<T, N>
    )
  }

  removePinFromChildren(columns: GroupedColumns<T, N>) {
    return columns.reduce(
      (nextColumns, column) => {
        const columnCopy = Object.assign({}, column)
        delete columnCopy.pin

        if (isColumnGroup(columnCopy)) {
          columnCopy.children = this.removePinFromChildren(columnCopy.children)
        }

        nextColumns.push(columnCopy)
        return nextColumns
      },
      [] as GroupedColumns<T, N>
    )
  }

  checkBoundsActions = throttle((clientX: number, clientY: number) => {
    const gridRect = this.mgr.gridEl!.getBoundingClientRect()
    const relativeX = clientX - gridRect.left
    const relativeY = clientY - gridRect.top
    const pinAreaBounds = 24 // 24px on edges = pin column
    let newPin: ColumnPin | undefined = undefined

    if (relativeX > 0 && relativeX < pinAreaBounds) {
      newPin = 'start'
      this.dragLabel.updateIcon(DragIcon.Pin)
    } else if (
      relativeX > this.mgr.$viewportWidth.value - pinAreaBounds &&
      relativeX < this.mgr.$viewportWidth.value
    ) {
      newPin = 'end'
      this.dragLabel.updateIcon(DragIcon.Pin)
    } else {
      const outOfBounds =
        relativeX < 0 ||
        relativeX > this.mgr.$viewportWidth.value ||
        relativeY < 0 ||
        relativeY > this.mgr.$viewportHeight.value

      newPin = undefined
      this.dragLabel.updateIcon(
        outOfBounds ? DragIcon.NotAllowed : DragIcon.Move
      )
    }

    // This will unecessarily trigger if a child of a pinned group doesn't
    // itself have a pin set but meh
    if (this.colToMove && newPin && newPin !== this.lastPin) {
      this.lastPin = newPin
      const newColumns = updateColumn(this.mgr.$columns.value, {
        ...this.colToMove,
        pin: newPin,
      })
      console.log('onColumnsChange')
      this.mgr.onColumnsChange?.(newColumns)
    }
  }, 150)
}

class DragLabel {
  static svgDragIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 492 493">
    <path fill="currentColor" d="M314.063 62.977 255.119 4.033c-2.672-2.672-6.236-4.04-9.92-4.032-3.752-.036-7.396 1.36-10.068 4.032l-57.728 57.728c-5.408 5.408-5.408 14.2 0 19.604l7.444 7.444c5.22 5.22 14.332 5.22 19.556 0l22.1-22.148v81.388c0 .248.144.452.188.684.6 7.092 6.548 12.704 13.8 12.704h10.52c7.644 0 13.928-6.208 13.928-13.852V67.87l22.108 22.152c5.408 5.408 14.18 5.408 19.584 0l7.432-7.436c5.408-5.412 5.408-14.208 0-19.608Zm-.008 346.46-7.44-7.456c-5.22-5.228-14.336-5.228-19.564 0l-22.108 22.152V344.73c0-7.648-6.288-14.16-13.924-14.16H240.49c-7.244 0-13.192 5.756-13.796 12.856-.044.236-.188.596-.188.84v81.084l-22.1-22.148c-5.224-5.224-14.356-5.224-19.58 0l-7.44 7.444c-5.4 5.404-5.392 14.2.016 19.608l57.732 57.724a13.634 13.634 0 0 0 9.668 4.032h.52c3.716 0 7.184-1.416 9.792-4.032l58.94-58.94c5.408-5.404 5.408-14.196 0-19.6ZM146.97 226.781h-79.1l22.152-22.032c2.612-2.608 4.048-6.032 4.048-9.74 0-3.712-1.436-7.164-4.048-9.768l-7.444-7.428c-5.408-5.408-14.204-5.4-19.604.008L4.03 236.761c-2.672 2.668-4.1 6.248-4.028 9.92-.076 3.82 1.356 7.396 4.028 10.068l57.728 57.732a13.818 13.818 0 0 0 9.804 4.056c3.552 0 7.1-1.352 9.804-4.056l7.44-7.44a13.758 13.758 0 0 0 4.052-9.8c0-3.712-1.436-7.232-4.052-9.836l-22.144-22.184h80.728c.244 0 .644-.06.876-.104 7.096-.6 12.892-6.468 12.892-13.716v-10.536c0-7.636-6.544-14.084-14.188-14.084Zm340.444 9.984L428.47 177.83c-5.404-5.408-14.2-5.408-19.604 0l-7.436 7.444c-2.612 2.604-4.052 6.088-4.052 9.796 0 3.712 1.436 7.072 4.052 9.68l22.148 22.032H344.07c-7.644 0-13.78 6.444-13.78 14.084v10.536c0 7.248 5.564 13.108 12.664 13.712.236.048.408.108.648.108h81.188l-22.156 22.18c-2.608 2.604-4.048 6.116-4.048 9.816 0 3.716 1.436 7.208 4.048 9.816l7.448 7.444a13.807 13.807 0 0 0 9.8 4.06 13.81 13.81 0 0 0 9.8-4.056l57.736-57.732a13.683 13.683 0 0 0 4.028-9.92c.06-3.82-1.368-7.4-4.032-10.064ZM245.73 207.541c-21.204 0-38.456 17.252-38.456 38.46 0 21.204 17.252 38.46 38.456 38.46 21.204 0 38.46-17.256 38.46-38.46 0-21.208-17.256-38.46-38.46-38.46Z" fill="#000" fill-rule="nonzero"/>
  </svg>
  `

  static svgNotAllowed = `
  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm0 2c1.8 0 3.5.6 4.9 1.7L3.7 14.9C2.6 13.5 2 11.8 2 10c0-4.4 3.6-8 8-8zm0 16c-1.8 0-3.5-.6-4.9-1.7L16.3 5.1C17.4 6.5 18 8.2 18 10c0 4.4-3.6 8-8 8z"/>
  </svg>
  `

  static svgPin = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
    <path fill="currentColor" d="M24.4 9.1 15.6.3c-.4-.4-1-.4-1.4 0L11 3.5c-.5.5-.3 1.1 0 1.4l.7.7-3 3c-1.5-.3-5.6-1-7.8 1.2-.4.4-.4 1 0 1.4l5.7 5.7-6.3 6.3c-.4.4-.4 1 0 1.4.4.4 1.1.3 1.4 0L8 18.3l5.7 5.7c.6.5 1.2.3 1.4 0 2.2-2.2 1.5-6.3 1.2-7.8l3-3 .7.7c.4.4 1 .4 1.4 0l3.2-3.2c.2-.6.2-1.2-.2-1.6Zm-3.9 2.5-.7-.7c-.4-.4-1-.4-1.4 0l-4.1 4.2c-.3.3-.4.6-.3 1 .3 1.1.8 3.8 0 5.6l-11-11c1.7-.8 4.5-.3 5.6 0 .3.1.7 0 1-.3l4.1-4.1c.6-.6.3-1.1 0-1.4l-.7-.7 1.9-1.8 7.4 7.4-1.8 1.8Z" fill="#000" fill-rule="nonzero"/>
  </svg>
  `

  el?: HTMLElement
  currIcon = DragIcon.Move
  width = 0
  height = 0

  getDragIconHTML(icon: DragIcon) {
    switch (icon) {
      case DragIcon.Move:
        return DragLabel.svgDragIcon
      case DragIcon.NotAllowed:
        return DragLabel.svgNotAllowed
      case DragIcon.Pin:
        return DragLabel.svgPin
      default:
        icon satisfies never
        return ''
    }
  }

  mount(label: string, icon: DragIcon) {
    if (this.el) {
      this.el.remove()
    }

    const el = document.createElement('div')
    el.classList.add('lg-drag-label')

    const style = document.createElement('style')
    style.textContent = `
      .lg-drag-label {
        pointer-events: none;
        position: absolute;
        left: -100vw;
        display: flex;
        align-items: center;
        gap: 0.5em;
        padding: 0.5em 0.625em;
        background: white;
        box-shadow: 10px 10px 18px 0px rgba(6, 7, 29, 0.7);
        border-radius: 3px;
        color: black;
      }
      .lg-drag-label svg {
        width: 16px;
      }
    `
    el.appendChild(style)

    const iconEl = document.createElement('svg')
    el.appendChild(iconEl)
    iconEl.outerHTML = this.getDragIconHTML(icon)

    const labelEl = document.createElement('span')
    labelEl.textContent = label
    el.appendChild(labelEl)

    this.el = el
    document.body.appendChild(el)
    this.currIcon = icon

    const box = this.el.getBoundingClientRect()
    this.width = box.width
    this.height = box.height

    return el
  }

  updateIcon(icon: DragIcon) {
    if (this.currIcon == icon) {
      return
    }

    if (this.el) {
      const iconEl = this.el.querySelector('svg')
      if (iconEl) {
        const iconHTML = this.getDragIconHTML(icon)
        iconEl.outerHTML = iconHTML
      }
      this.currIcon = icon
    }
  }

  hide() {
    if (this.el) {
      this.el.style.setProperty('left', '-100vw')
    }
  }

  unmount() {
    if (this.el) {
      this.el.remove()
      this.el = undefined
    }
  }
}
