import { memo } from 'react'
import {
  CellPosition,
  CellSelection,
  DerivedColumn,
  DerivedRow,
  BodyAreaDesc,
  ItemId,
  RenderRowDetails,
  RowState,
  StateSetter,
  isCellSelected,
  GridManager,
} from '@lightfin/datagrid'

import { N } from './types'
import { GridDetailRows } from './GridDetailRows'
import { Cell } from './Cell'

function getCellWidth<T>(
  span: number,
  column: DerivedColumn<T, N>,
  columns: DerivedColumn<T, N>[],
  columnIndex: number,
  areaWidth: number
) {
  if (span === -1) {
    return areaWidth - column.offset
  }
  let size = column.size
  for (let i = columnIndex + 1; i < columnIndex + span; i++) {
    size += columns[i].size
  }
  return size
}

function getCellHeight<T>(
  span: number,
  row: DerivedRow<T>,
  rows: DerivedRow<T>[],
  rowIndex: number,
  areaHeight: number
) {
  if (span === -1) {
    return areaHeight - row.offset
  }
  let size = row.size
  for (let i = rowIndex + 1; i < rowIndex + span; i++) {
    size += rows[i].size
  }
  return size
}

interface GridAreaProps<T> {
  mgr: GridManager<T, N>
  area: BodyAreaDesc<T, N>
  columns: DerivedColumn<T, N>[]
  rows: DerivedRow<T>[]
  rowState: RowState<any>
  setRowState?: StateSetter<any>
  detailsWidth: number
  renderRowDetailsRef: React.MutableRefObject<RenderRowDetails<T, N>>
  selection?: CellSelection
  selectionStartCell?: CellPosition
  isFirstColumnGroup: boolean
  colReorderKey?: ItemId
  enableColumnReorder?: boolean
}

export function GridAreaNoMemo<T>({
  mgr,
  area,
  columns,
  rows,
  rowState,
  setRowState,
  detailsWidth,
  renderRowDetailsRef,
  selection,
  selectionStartCell,
  isFirstColumnGroup,
  colReorderKey,
  enableColumnReorder,
}: GridAreaProps<T>) {
  if (!rows.length || !columns.length) {
    return null
  }

  const rowSpans = new Map<number, number>()

  return (
    <div className="lg-area">
      <div
        role="rowgroup"
        className="lg-area-inner"
        style={{
          position: area.pinnedX || area.pinnedY ? 'sticky' : 'absolute',
          [area.pinnedX && !area.pinnedY ? 'marginTop' : 'top']: area.windowY,
          left: area.windowX,
          width: area.width,
          height: area.height,
        }}
      >
        {rows.map((row, ri) => {
          let skipColCount = 0
          return (
            <div
              key={row.rowId}
              role="row"
              className={`lg-row ${
                row.rowIndex % 2 === 0 ? 'lg-row-even' : 'lg-row-odd'
              }`}
              style={{
                height: row.size,
                transform: `translateY(${row.offset}px)`,
              }}
            >
              {columns.reduce((cells, column, ci) => {
                // Skip cells that are spanned into
                if (skipColCount) {
                  skipColCount--
                  return cells
                }

                let rowSkipCount: number | undefined
                if (rowSpans.size && (rowSkipCount = rowSpans.get(column.colIndex))) {
                  rowSpans.set(column.colIndex, rowSkipCount - 1)
                  return cells
                }

                let colSpan = 1
                let width = column.size
                if (column.colSpan) {
                  colSpan = Math.min(column.colSpan(row.item), columns.length - ci)
                  width = getCellWidth(colSpan, column, columns, ci, area.width)
                  if (colSpan > 1) {
                    skipColCount = colSpan - 1
                  } else if (colSpan === -1) {
                    skipColCount = Infinity
                  }
                }

                let rowSpan = 1
                let height = row.size
                if (column.rowSpan) {
                  rowSpan = Math.min(column.rowSpan(row.item), rows.length - ri)
                  height = getCellHeight(rowSpan, row, rows, ri, area.height)
                  if (rowSpan > 1) {
                    rowSpans.set(column.colIndex, rowSpan)
                  } else if (rowSpan === -1) {
                    rowSpans.set(column.colIndex, Infinity)
                  }
                }

                cells.push(
                  <Cell<T>
                    key={column.key}
                    mgr={mgr}
                    column={column}
                    row={row}
                    rowStateItem={rowState[row.rowId]}
                    setRowState={setRowState}
                    pinnedX={area.pinnedX}
                    pinnedY={area.pinnedY}
                    colReorderKey={colReorderKey}
                    enableColumnReorder={enableColumnReorder}
                    selected={isCellSelected(column.colIndex, row.rowIndex, selection)}
                    selectionStart={Boolean(
                      selectionStartCell &&
                        selectionStartCell.colIndex === column.colIndex &&
                        selectionStartCell.rowIndex === row.rowIndex
                    )}
                    width={width}
                    height={height}
                    zIndex={colSpan == 1 ? undefined : 1}
                  />
                )

                return cells
              }, [] as JSX.Element[])}
            </div>
          )
        })}
        {isFirstColumnGroup && area.rowResult.itemDetails ? (
          <GridDetailRows
            itemDetails={area.rowResult.itemDetails}
            width={detailsWidth}
            renderRowDetails={renderRowDetailsRef.current}
          />
        ) : undefined}
        <div className="lg-area-h-borders" data-borderbottom={!area.lastY} />
        <div className="lg-area-v-borders" />
      </div>
    </div>
  )
}

const typedMemo: <T>(c: T) => T = memo
export const GridArea = typedMemo(GridAreaNoMemo)
