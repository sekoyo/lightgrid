import {
  AreaPos,
  DerivedColumnGroup,
  DerivedColumnOrGroup,
  GroupedColumns,
} from '../types'
import { isColumnGroup, isDerivedColumnGroup } from '../utils'
import { GridPlugin } from '../GridPlugin'

const defaultColGroupWidth = 100
const defaultAbsMinWidth = 30

export type ColResizeData = {
  colAreaPos: AreaPos
  left: number
}

export type SetColResizeData = (
  colReorderKey: ColResizeData | undefined
) => void

export class ColumnResizePlugin<T, N> extends GridPlugin<T, N> {
  startClientX = 0
  startClientY = 0
  column?: DerivedColumnOrGroup<T, N>
  colAreaPos?: AreaPos
  resizing = false

  unmount() {
    window.removeEventListener('pointermove', this.onWindowPointerMove)
    window.removeEventListener('pointerup', this.onWindowPointerUp)
  }

  rangeBoundDiff(column: DerivedColumnOrGroup<T, N>, diffX: number) {
    const minWidth = isColumnGroup(column)
      ? defaultColGroupWidth
      : column.minWidth ?? defaultAbsMinWidth

    if (column.size + diffX < minWidth) {
      return minWidth - column.size
    }

    return diffX
  }

  isResizing() {
    return this.resizing
  }

  onPointerDown = (
    e: PointerEvent,
    column: DerivedColumnOrGroup<T, N>,
    colAreaPos: AreaPos
  ) => {
    if (!this.mgr.onColumnsChange) {
      console.error(
        'onColumnsChange prop is required to enable column resizing'
      )
      return
    }

    this.resizing = true
    this.column = column
    this.colAreaPos = colAreaPos
    this.startClientX = e.clientX
    this.startClientY = e.clientY

    window.addEventListener('pointermove', this.onWindowPointerMove)
    window.addEventListener('pointerup', this.onWindowPointerUp)
  }

  onWindowPointerMove = (e: PointerEvent) => {
    const column = this.column!
    const colAreaPos = this.colAreaPos!
    const diffX = this.rangeBoundDiff(column, e.clientX - this.startClientX)

    let left = column.offset + column.size + diffX

    if (colAreaPos === AreaPos.Middle) {
      left = this.mgr.$derivedCols.value.middle.startOffset + left
    } else if (colAreaPos === AreaPos.End) {
      left +=
        this.mgr.$derivedCols.value.end.startOffset -
        this.mgr.$horizontalScrollSize.value
    }

    this.mgr.setColResizeData({ colAreaPos, left })
  }

  onWindowPointerUp = (e: PointerEvent) => {
    // Sort is on 'click' which is down anywhere and then up on the
    // element. We have this slight delay so that resizing is still
    // true in the changeSort click handler and we don't accidentally
    // sort a header when releasing resizing.
    setTimeout(() => {
      this.resizing = false
    }, 0)

    const column = this.column!
    const diffX = this.rangeBoundDiff(column, e.clientX - this.startClientX)
    const nextColumns = this.updateColumnWidth(column, column.size + diffX)
    this.mgr.onColumnsChange!(nextColumns)

    window.removeEventListener('pointermove', this.onWindowPointerMove)
    window.removeEventListener('pointerup', this.onWindowPointerUp)
    this.mgr.setColResizeData(undefined)
  }

  getGroupUpdates(group: DerivedColumnGroup<T, N>, newSize: number) {
    const columnUpdates = new Map<string | number, number>()

    function recursiveUpdate(
      currentGroup: DerivedColumnGroup<T, N>,
      currentNewSize: number
    ) {
      for (let i = 0; i < currentGroup.children.length; i++) {
        const colOrGroup = currentGroup.children[i]
        const fr = colOrGroup.size / currentGroup.size
        const size = fr * currentNewSize

        if (isDerivedColumnGroup(colOrGroup)) {
          recursiveUpdate(colOrGroup, size)
        } else {
          columnUpdates.set(colOrGroup.key, size)
        }
      }
    }

    recursiveUpdate(group, newSize)

    return columnUpdates
  }

  updateColumnWidth(colOrGroup: DerivedColumnOrGroup<T, N>, newSize: number) {
    const nextColumns: GroupedColumns<T, N> = [...this.mgr.$columns.value]
    const isUpdatingGroup = isDerivedColumnGroup(colOrGroup)
    let columnUpdates: Map<string | number, number>

    if (isUpdatingGroup) {
      columnUpdates = this.getGroupUpdates(colOrGroup, newSize)
    } else {
      columnUpdates = new Map([[colOrGroup.key, newSize]])
    }

    function recursiveUpdate(currentGroup: GroupedColumns<T, N>) {
      for (let i = 0; i < currentGroup.length; i++) {
        const colOrGroup = currentGroup[i]

        if (isColumnGroup(colOrGroup)) {
          recursiveUpdate(colOrGroup.children)
        } else {
          const size = columnUpdates.get(colOrGroup.key)
          if (size !== undefined) {
            colOrGroup.width = size
            if (!isUpdatingGroup) {
              break
            }
          }
        }
      }
    }

    recursiveUpdate(nextColumns)
    return nextColumns
  }
}
