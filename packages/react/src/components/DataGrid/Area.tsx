import { memo, useCallback } from 'react'
import {
  CellPosition,
  CellSelection,
  DerivedColumn,
  DerivedRow,
  GridArea,
  OnRowStateChange,
  RenderRowDetails,
  RowState,
} from '@lightfin/datagrid'

import { R } from './types'
import { GridDetailRows } from './GridDetailRows'
import { Cell } from './Cell'

function isCellSelected(colIndex: number, rowIndex: number, selection?: CellSelection) {
  return Boolean(
    selection &&
      selection.colRange[0] <= colIndex &&
      selection.colRange[1] >= colIndex &&
      selection.rowRange[0] <= rowIndex &&
      selection.rowRange[1] >= rowIndex
  )
}

interface AreaProps<T> {
  area: GridArea<T, R>
  columns: DerivedColumn<T, R>[]
  rows: DerivedRow<T>[]
  rowState: RowState
  onRowStateChangeRef: React.MutableRefObject<OnRowStateChange>
  detailsWidth: number
  renderRowDetailsRef: React.MutableRefObject<RenderRowDetails<T, R>>
  selection?: CellSelection
  selectionStartCell?: CellPosition
  isFirstColumnGroup: boolean
}

export function AreaNoMemo<T>({
  area,
  columns,
  rows,
  rowState,
  onRowStateChangeRef,
  detailsWidth,
  renderRowDetailsRef,
  selection,
  selectionStartCell,
  isFirstColumnGroup,
}: AreaProps<T>) {
  const onExpandToggle = useCallback(
    (rowId: string | number) =>
      onRowStateChangeRef.current(rowId, {
        ...rowState[rowId],
        detailsExpanded: !rowState[rowId]?.detailsExpanded,
      }),
    [rowState, onRowStateChangeRef]
  )

  if (!rows.length || !columns.length) {
    return null
  }

  return (
    <div className="lfg-area">
      <div
        className="lfg-area-inner"
        style={{
          position: area.pinnedX || area.pinnedY ? 'sticky' : 'absolute',
          ...{ [area.pinnedX && !area.pinnedY ? 'marginTop' : 'top']: area.windowY },
          left: area.windowX,
          width: area.width,
          height: area.height,
        }}
      >
        {rows.map(row => {
          return (
            <div
              key={row.rowId}
              className="lfg-row"
              style={{
                height: row.size,
                transform: `translateY(${row.offset}px)`,
              }}
            >
              {columns.map(column => (
                <Cell<T>
                  key={column.key}
                  column={column}
                  row={row}
                  rowId={row.rowId}
                  rowStateItem={rowState[row.rowId]}
                  hasExpandInCell={Boolean(row.hasDetails && column.colIndex === 0)}
                  pinnedX={area.pinnedX}
                  pinnedY={area.pinnedY}
                  selected={isCellSelected(column.colIndex, row.rowIndex, selection)}
                  selectionStart={Boolean(
                    selectionStartCell &&
                      selectionStartCell.colIndex === column.colIndex &&
                      selectionStartCell.rowIndex === row.rowIndex
                  )}
                  onExpandToggle={onExpandToggle}
                />
              ))}
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
      </div>
    </div>
  )
}

const typedMemo: <T>(c: T) => T = memo
export const Area = typedMemo(AreaNoMemo)
