import { memo } from 'react'
import {
  DerivedColumn,
  DerivedRow,
  GridManager,
  ItemId,
  RowStateItem,
} from '@lightfin/datagrid'

import { DownArrow } from '../Icons'
import { IconButton } from '../IconButton'
import { R } from './types'
import { DefaultCellComponent } from './DefaultCellComponent'

// Not passing in the row reference itself means that
// if a data change triggered rows being re-derived,
// this memo will only allow the rows whose `item`
// reference changed.
interface CellProps<T> {
  mgr: GridManager<T, React.ReactNode>
  column: DerivedColumn<T, R>
  row: DerivedRow<T>
  rowId: ItemId
  rowStateItem: RowStateItem | undefined
  hasExpandInCell: boolean
  pinnedX: boolean
  pinnedY: boolean
  colReorderKey?: ItemId
  enableColumnReorder?: boolean
  selected: boolean
  selectionStart: boolean
  onExpandToggle: (rowId: ItemId) => void
}

export function CellNoMemo<T>({
  mgr,
  column,
  row,
  rowId,
  rowStateItem,
  hasExpandInCell,
  pinnedX,
  pinnedY,
  colReorderKey,
  selected,
  selectionStart,
  enableColumnReorder,
  onExpandToggle,
}: CellProps<T>) {
  return (
    <div
      role="cell"
      className="lfg-cell"
      data-pinned-x={pinnedX}
      data-pinned-y={pinnedY}
      data-selected={selected}
      data-selection-start={selectionStart}
      data-reordering={!!colReorderKey}
      data-moving-col={column.key === colReorderKey}
      style={{
        width: column.size,
        transform: `translateX(${column.offset}px)`,
      }}
      onPointerEnter={
        enableColumnReorder && colReorderKey
          ? e =>
              mgr.columnReorderPlugin?.onPointerEnter(e.currentTarget, e.clientX, column)
          : undefined
      }
      onPointerMove={
        enableColumnReorder && colReorderKey
          ? e =>
              mgr.columnReorderPlugin?.onPointerMove(e.currentTarget, e.clientX, column)
          : undefined
      }
    >
      {hasExpandInCell && (
        <IconButton
          title="Expand row details"
          className="lfg-cell-details-btn"
          style={
            rowStateItem?.detailsExpanded ? undefined : { transform: 'rotate(270deg)' }
          }
          onClick={() => onExpandToggle(rowId)}
        >
          <DownArrow />
        </IconButton>
      )}
      {column.cellComponent?.({ column, item: row.item }) || (
        <DefaultCellComponent column={column} item={row.item} />
      )}
    </div>
  )
}

const typedMemo: <T>(c: T) => T = memo
export const Cell = typedMemo(CellNoMemo)
