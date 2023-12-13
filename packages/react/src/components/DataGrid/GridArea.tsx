import { memo, useCallback, useState } from 'react'
import {
  CellPosition,
  CellSelection,
  DerivedColumn,
  DerivedRow,
  BodyAreaDesc,
  ItemId,
  OnRowStateChange,
  RenderRowDetails,
  RowState,
  StateSetter,
  isCellSelected,
  GridManager,
} from '@lightfin/datagrid'

import { N } from './types'
import { GridDetailRows } from './GridDetailRows'
import { Cell } from './Cell'

function getCellSize<T>(
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

interface GridAreaProps<T> {
  mgr: GridManager<T, React.ReactNode>
  area: BodyAreaDesc<T, N>
  columns: DerivedColumn<T, N>[]
  rows: DerivedRow<T>[]
  rowState: RowState<any>
  setRowState?: StateSetter<any>
  onRowStateChangeRef: React.MutableRefObject<OnRowStateChange<any>>
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
  onRowStateChangeRef,
  detailsWidth,
  renderRowDetailsRef,
  selection,
  selectionStartCell,
  isFirstColumnGroup,
  colReorderKey,
  enableColumnReorder,
}: GridAreaProps<T>) {
  const [rowSpans] = useState(() => new Map<ItemId, number>())
  const onExpandToggle = useCallback(
    (rowId: ItemId) =>
      onRowStateChangeRef.current(rowId, {
        ...rowState[rowId],
        expanded: !rowState[rowId]?.expanded,
      }),
    [rowState, onRowStateChangeRef]
  )

  if (!rows.length || !columns.length) {
    return null
  }

  return (
    <div className="lfg-area" data-borderbottom={!area.lastY}>
      <div
        role="rowgroup"
        className="lfg-area-inner"
        style={{
          position: area.pinnedX || area.pinnedY ? 'sticky' : 'absolute',
          [area.pinnedX && !area.pinnedY ? 'marginTop' : 'top']: area.windowY,
          left: area.windowX,
          width: area.width,
          height: area.height,
        }}
      >
        {rows.map(row => {
          let skipColCount = 0
          // rowSpan 1 means no skip, so we sub by 1.
          const skipRowCount = (rowSpans.get(row.rowId) ?? 1) - 1
          return (
            <div
              key={row.rowId}
              role="row"
              className={`lfg-row ${
                row.rowIndex % 2 === 0 ? 'lfg-row-even' : 'lfg-row-odd'
              }`}
              style={{
                height: row.size,
                transform: `translateY(${row.offset}px)`,
              }}
            >
              {columns.reduce((cells, column, i) => {
                // Skip cells that are spanned into
                if (skipColCount) {
                  skipColCount--
                  return cells
                }
                if (skipRowCount) {
                  rowSpans.set(row.rowId, skipRowCount - 1)
                  return cells
                }
                let span = 1
                let size = column.size

                if (column.colSpan) {
                  span = Math.min(column.colSpan(row.item), columns.length - i)
                  size = getCellSize(span, column, columns, i, area.width)
                  if (span > 1) {
                    skipColCount = span - 1
                  } else if (span === -1) {
                    skipColCount = Infinity
                  }
                }

                if (column.rowSpan) {
                  rowSpans.set(row.rowId, column.rowSpan(row.item))
                }

                cells.push(
                  <Cell<T>
                    key={column.key}
                    mgr={mgr}
                    column={column}
                    item={row.item}
                    rowId={row.rowId}
                    rowStateItem={rowState[row.rowId]}
                    setRowState={setRowState}
                    hasExpandInCell={Boolean(row.hasDetails && column.colIndex === 0)}
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
                    width={size}
                    zIndex={span === 1 ? undefined : 1}
                    onExpandToggle={onExpandToggle}
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
        <div className="lfg-area-h-borders" />
        <div className="lfg-area-v-borders" />
      </div>
    </div>
  )
}

const typedMemo: <T>(c: T) => T = memo
export const GridArea = typedMemo(GridAreaNoMemo)
