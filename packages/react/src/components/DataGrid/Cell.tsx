import { memo } from 'react'
import { DerivedColumn, DerivedRow, RowStateItem } from '@lightfin/datagrid'

import { DownArrow } from '../Icons'
import { IconButton } from '../IconButton'
import { R } from './types'
import { DefaultCellComponent } from './DefaultCellComponent'

// Not passing in the row reference itself means that
// if a data change triggered rows being re-derived,
// this memo will only allow the rows whose `item`
// reference changed.
interface CellProps<T> {
  column: DerivedColumn<T, R>
  row: DerivedRow<T>
  rowId: string | number
  rowStateItem: RowStateItem | undefined
  hasExpandInCell: boolean
  pinnedX: boolean
  pinnedY: boolean
  selected: boolean
  selectionStart: boolean
  onExpandToggle: (rowId: string | number) => void
}

export function CellNoMemo<T>({
  column,
  row,
  rowId,
  rowStateItem,
  hasExpandInCell,
  pinnedX,
  pinnedY,
  selected,
  selectionStart,
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
      style={{
        width: column.size,
        transform: `translateX(${column.offset}px)`,
      }}
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
