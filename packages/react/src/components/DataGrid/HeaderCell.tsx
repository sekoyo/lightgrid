import {
  AreaPos,
  DerivedColumnOrGroup,
  GridManager,
  ItemId,
  SortDirection,
  isColumnGroup,
  isDerivedColumnGroup,
} from '@lightgrid/core'
import { N } from './types'
import { SortAscendingIcon, SortDescendingIcon } from '../Icons'

interface HeaderCellProps<T> {
  mgr: GridManager<T, N>
  column: DerivedColumnOrGroup<T, N>
  colAreaPos: AreaPos
  headerRowHeight: number
  enableColumnResize?: boolean
  enableColumnReorder?: boolean
  colReorderKey?: ItemId
  outline?: boolean
  border?: boolean
}

export function HeaderCell<T>({
  mgr,
  column,
  colAreaPos,
  headerRowHeight,
  enableColumnResize,
  enableColumnReorder,
  colReorderKey,
  outline,
  border,
}: HeaderCellProps<T>) {
  const sortable = !isDerivedColumnGroup(column) && column.sortable
  const label = column.header !== undefined ? column.header : column.key
  const isGroup = isColumnGroup(column)
  return (
    <div
      className="lg-header-cell"
      data-reordering={!!colReorderKey}
      data-moving-col={column.key === colReorderKey}
      data-outline={outline}
      data-border={border}
      data-align={column.contentAlign}
      role={sortable ? 'button' : undefined}
      style={{
        width: column.size,
        height: column.headerRowSpan * headerRowHeight,
        transform: `translate(${column.offset}px, ${
          column.rowIndex * headerRowHeight
        }px)`,
      }}
      onClick={sortable ? () => mgr.changeSort(column.key) : undefined}
      onPointerDown={
        enableColumnReorder
          ? e => mgr.columnReorderPlugin?.onPointerDown(e.nativeEvent, column)
          : undefined
      }
      onPointerEnter={
        enableColumnReorder && colReorderKey
          ? e =>
              mgr.columnReorderPlugin?.onPointerEnter(
                e.currentTarget,
                e.clientX,
                column
              )
          : undefined
      }
      onPointerMove={
        enableColumnReorder && colReorderKey
          ? e =>
              mgr.columnReorderPlugin?.onPointerMove(
                e.currentTarget,
                e.clientX,
                column
              )
          : undefined
      }
    >
      <div className="lg-header-cell-inner">
        <div
          className="lg-header-cell-label"
          title={typeof label === 'string' ? label : undefined}
        >
          {label}
          {!isGroup &&
            column.sortDirection &&
            (column.sortDirection === SortDirection.Asc ? (
              <SortAscendingIcon className="lg-header-sort-indicator" />
            ) : (
              <SortDescendingIcon className="lg-header-sort-indicator" />
            ))}
        </div>
      </div>
      {enableColumnResize && (
        <div
          className="lg-header-grip-resizer"
          role="button"
          aria-labelledby="resize column handle"
          onPointerDown={e => {
            e.stopPropagation()
            mgr.columnResizePlugin?.onPointerDown(
              e.nativeEvent,
              column,
              colAreaPos
            )
          }}
        />
      )}
    </div>
  )
}
