import {
  AreaPos,
  DerivedColumnOrGroup,
  GridManager,
  ItemId,
  SortDirection,
  isColumnGroup,
  isDerivedColumnGroup,
} from '@lightfin/datagrid'
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
  isLastInRow?: boolean
}

export function HeaderCell<T>({
  mgr,
  column,
  colAreaPos,
  headerRowHeight,
  enableColumnResize,
  enableColumnReorder,
  colReorderKey,
  isLastInRow,
}: HeaderCellProps<T>) {
  const sortable = !isDerivedColumnGroup(column) && column.sortable
  const label = column.header !== undefined ? column.header : column.key
  const isGroup = isColumnGroup(column)
  return (
    <div
      class="lg-header-cell"
      data-reordering={!!colReorderKey}
      data-moving-col={column.key === colReorderKey}
      data-last-in-row={isLastInRow}
      role={sortable ? 'button' : undefined}
      style={{
        width: `${column.size}px`,
        height: `${column.headerRowSpan * headerRowHeight}px`,
        transform: `translate(${column.offset}px, ${
          column.rowIndex * headerRowHeight
        }px)`,
      }}
      onClick={sortable ? () => mgr.changeSort(column.key) : undefined}
      onPointerDown={
        enableColumnReorder
          ? e => mgr.columnReorderPlugin?.onPointerDown(e, column)
          : undefined
      }
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
      <div class="lg-header-cell-inner">
        <div
          class="lg-header-cell-label"
          title={typeof label === 'string' ? label : undefined}
        >
          {label}
        </div>
        {!isGroup &&
          column.sortDirection &&
          (column.sortDirection === SortDirection.Asc ? (
            <SortAscendingIcon class="lg-header-sort-indicator" />
          ) : (
            <SortDescendingIcon class="lg-header-sort-indicator" />
          ))}
      </div>
      {enableColumnResize && (
        <div
          class="lg-header-grip-resizer"
          role="button"
          aria-labelledby="resize handle"
          onPointerDown={e => {
            e.stopPropagation()
            mgr.columnResizePlugin?.onPointerDown(e, column, colAreaPos)
          }}
        />
      )}
    </div>
  )
}
