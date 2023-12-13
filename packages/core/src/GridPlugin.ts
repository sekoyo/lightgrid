import { getColumnOffset, getRowOffset } from './constants'
import { type GridManager } from './GridManager'
import { type CellPosition, type BodyAreaDesc } from './types'
import { binarySearch } from './utils'

export abstract class GridPlugin<T, N> {
  mgr: GridManager<T, N>

  constructor(mgr: GridManager<T, N>) {
    this.mgr = mgr
  }
  mount?(): void
  unmount?(): void
  onResize?(width: number, height: number): void

  getBodyAreaFromPoint(windowX: number, windowY: number) {
    const areasByCol = this.mgr.$areas().byCol
    for (let i = 0; i < areasByCol.length; i++) {
      const areas = areasByCol[i]
      if (
        windowX >= areas[0].windowX &&
        windowX <= areas[0].windowX + areas[0].windowWidth
      ) {
        // We found the column now find the row
        for (let j = 0; j < areas.length; j++) {
          const area = areas[j]
          if (windowY >= area.windowY && windowY <= area.windowY + area.windowHeight) {
            return area
          }
        }
      }
    }
  }

  getCellInAreaFromPoint(
    area: BodyAreaDesc<T, N>,
    windowX: number,
    windowY: number
  ): CellPosition {
    let scrolledX = windowX - area.colResult.startOffset
    let scrolledY = windowY - area.rowResult.startOffset

    if (!area.pinnedX) {
      scrolledX += this.mgr.$scrollX()
    }
    if (!area.pinnedY) {
      scrolledY += this.mgr.$scrollY()
    }

    const colIndex = binarySearch(area.colResult.items, scrolledX, getColumnOffset)
    const rowIndex = binarySearch(area.rowResult.items, scrolledY, getRowOffset)

    return {
      colIndex: area.colResult.items[colIndex].colIndex,
      rowIndex: area.rowResult.items[rowIndex].rowIndex,
    }
  }

  getColResultFromIndex(colIndex: number) {
    const cols = this.mgr.$derivedCols()
    if (colIndex < cols.start.items.length) {
      return cols.start
    } else if (colIndex >= cols.start.items.length + cols.middle.items.length) {
      return cols.end
    } else {
      return cols.middle
    }
  }

  getColPosFromIndex(colIndex: number) {
    this.getColResultFromIndex(colIndex).areaPos
  }

  getRowResultFromIndex(rowIndex: number) {
    const rows = this.mgr.$derivedRows()
    if (rowIndex < rows.start.items.length) {
      return rows.start
    } else if (rowIndex >= rows.start.items.length + rows.middle.items.length) {
      return rows.end
    } else {
      return rows.middle
    }
  }

  getRowPosFromIndex(colIndex: number) {
    return this.getColResultFromIndex(colIndex).areaPos
  }
}
