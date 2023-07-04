import { AreaPos, DerivedColumn, DerivedColumnGroup, GroupedColumns } from '../types'
import { isColumnGroup, isDerivedColumnGroup } from '../utils'
import { GridManager } from '../GridManager'
import { GridPlugin } from '../GridPlugin'

const defaultColGroupWidth = 100
const defaultAbsMinWidth = 30

export type ColResizeData = {
  colAreaPos: AreaPos
  left: number
}

export type SetColResizeData = (colResizeData: ColResizeData | undefined) => void

export class ColumnSortPlugin<T, R> extends GridPlugin<T, R> {
  rect?: DOMRect
  setColResizeData: SetColResizeData
  startClientX = 0
  startClientY = 0
  column?: DerivedColumnGroup<T, R> | DerivedColumn<T, R>
  colAreaPos?: AreaPos

  constructor(mgr: GridManager<T, R>, setColResizeData: SetColResizeData) {
    super(mgr)
    this.setColResizeData = setColResizeData
  }

  unmount() {
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerup', this.onPointerUp)
  }

  rangeBoundDiff(column: DerivedColumnGroup<T, R> | DerivedColumn<T, R>, diffX: number) {
    const minWidth = isColumnGroup(column)
      ? defaultColGroupWidth
      : column.minWidth ?? defaultAbsMinWidth

    if (column.size + diffX < minWidth) {
      return minWidth - column.size
    }

    return diffX
  }

  onPointerDown = (
    e: PointerEvent,
    column: DerivedColumnGroup<T, R> | DerivedColumn<T, R>,
    colAreaPos: AreaPos
  ) => {
    this.column = column
    this.colAreaPos = colAreaPos
    this.rect = this.mgr.gridEl!.getBoundingClientRect()
    this.startClientX = e.clientX
    this.startClientY = e.clientY

    window.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('pointerup', this.onPointerUp)
  }

  onPointerMove = (e: PointerEvent) => {
    const column = this.column!
    const colAreaPos = this.colAreaPos!
    const diffX = this.rangeBoundDiff(column, e.clientX - this.startClientX)

    let left = column.offset + column.size + diffX

    if (colAreaPos === AreaPos.Middle) {
      left = this.mgr.$derivedCols().middle.startOffset + left - this.mgr.$scrollX()
    } else if (colAreaPos === AreaPos.End) {
      left += this.mgr.$derivedCols().end.startOffset - this.mgr.$scrollbarWidth()
    }

    this.setColResizeData({ colAreaPos, left })
  }

  onPointerUp = (e: PointerEvent) => {
    if (this.mgr.onColumnsChange) {
      const column = this.column!
      const diffX = this.rangeBoundDiff(column, e.clientX - this.startClientX)
      const nextColumns = this.updateColumnWidth(column, column.size + diffX)
      this.mgr.onColumnsChange(nextColumns)
    } else {
      console.warn(
        'onColumnsChange prop must be passed into the grid to enable column resizing'
      )
    }

    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerup', this.onPointerUp)
    this.setColResizeData(undefined)
  }

  getGroupUpdates(group: DerivedColumnGroup<T, R>, newSize: number) {
    const columnUpdates = new Map<string | number, number>()

    function recursiveUpdate(
      currentGroup: DerivedColumnGroup<T, R>,
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

  updateColumnWidth(
    colOrGroup: DerivedColumnGroup<T, R> | DerivedColumn<T, R>,
    newSize: number
  ) {
    const nextColumns: GroupedColumns<T, R> = [...this.mgr.$columns()]
    const isUpdatingGroup = isDerivedColumnGroup(colOrGroup)
    let columnUpdates: Map<string | number, number>

    if (isUpdatingGroup) {
      columnUpdates = this.getGroupUpdates(colOrGroup, newSize)
    } else {
      columnUpdates = new Map([[colOrGroup.key, newSize]])
    }

    function recursiveUpdate(currentGroup: GroupedColumns<T, R>) {
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
