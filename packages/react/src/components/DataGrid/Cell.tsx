import { memo } from 'react'
import { DerivedColumn, GridManager, ItemId, RowStateItem } from '@lightfin/datagrid'

import { DownArrow } from '../Icons'
import { IconButton } from '../IconButton'
import { R } from './types'
import { DefaultCellComponent } from './DefaultCellComponent'

interface CellProps<T> {
  mgr: GridManager<T, React.ReactNode>
  column: DerivedColumn<T, N>
  // Passing in item instead of `row: DerivedRow<T>` means that if data changes
  // and rows are re-derived, only cells with a changed item will re-render.
  item: T
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
  item,
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
      {column.cellComponent?.(column, item) || (
        <DefaultCellComponent column={column} item={item} />
      )}
    </div>
  )
}

const typedMemo: <T>(c: T) => T = memo
export const Cell = typedMemo(CellNoMemo)
