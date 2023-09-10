import { memo, useCallback } from 'react'
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
  isCellSelected,
  GridManager,
} from '@lightfin/datagrid'

import { R } from './types'
import { GridDetailRows } from './GridDetailRows'
import { Cell } from './Cell'

interface GridAreaProps<T> {
  mgr: GridManager<T, React.ReactNode>
  area: BodyAreaDesc<T, N>
  columns: DerivedColumn<T, N>[]
  rows: DerivedRow<T>[]
  rowState: RowState
  onRowStateChangeRef: React.MutableRefObject<OnRowStateChange>
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
  onRowStateChangeRef,
  detailsWidth,
  renderRowDetailsRef,
  selection,
  selectionStartCell,
  isFirstColumnGroup,
  colReorderKey,
  enableColumnReorder,
}: GridAreaProps<T>) {
  const onExpandToggle = useCallback(
    (rowId: ItemId) =>
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
        {rows.map(row => (
          <div
            key={row.rowId}
            role="row"
            className="lfg-row"
            style={{
              height: row.size,
              transform: `translateY(${row.offset}px)`,
            }}
          >
            {columns.map(column => (
              <Cell<T>
                key={column.key}
                mgr={mgr}
                column={column}
                item={row.item}
                rowId={row.rowId}
                rowStateItem={rowState[row.rowId]}
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
                onExpandToggle={onExpandToggle}
              />
            ))}
          </div>
        ))}
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
