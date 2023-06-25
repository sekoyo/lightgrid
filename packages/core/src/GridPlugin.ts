import { getColumnOffset, getRowOffset } from './constants'
import { type GridManager } from './GridManager'
import type { CellPosition, GridAreaDesc } from './types'
import { binarySearch } from './utils'

export abstract class GridPlugin<T, R> {
  mgr: GridManager<T, R>

  constructor(mgr: GridManager<T, R>) {
    this.mgr = mgr
  }
  mount?(): void
  unmount?(): void
  onResize?(width: number, height: number): void

  getAreaFromPoint(windowX: number, windowY: number) {
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
    area: GridAreaDesc<T, R>,
    windowX: number,
    windowY: number
  ): CellPosition {
    let relativeX = windowX - area.colResult.startOffset
    let relativeY = windowY - area.rowResult.startOffset

    if (!area.pinnedX) {
      relativeX += this.mgr.$scrollX()
    }
    if (!area.pinnedY) {
      relativeY += this.mgr.$scrollY()
    }

    const colIndex = binarySearch(area.colResult.items, relativeX, getColumnOffset)
    const rowIndex = binarySearch(area.rowResult.items, relativeY, getRowOffset)

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
}
