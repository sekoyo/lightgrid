import {
  AreaPos,
  DerivedColumnOrGroup,
  GridManager,
  ItemId,
  SortDirection,
  isColumnGroup,
  isDerivedColumnGroup,
} from '@lightfin/datagrid'
import SortAscendingIcon from '@lightfin/datagrid/dist/assets/sort-ascending.svg?react'
import SortDescendingIcon from '@lightfin/datagrid/dist/assets/sort-descending.svg?react'
import { N } from './types'

interface HeaderCellProps<T> {
  mgr: GridManager<T, React.ReactNode>
  column: DerivedColumnOrGroup<T, N>
  colAreaPos: AreaPos
  headerRowHeight: number
  enableColumnResize?: boolean
  enableColumnReorder?: boolean
  colReorderKey?: ItemId
}

export function HeaderCell<T>({
  mgr,
  column,
  colAreaPos,
  headerRowHeight,
  enableColumnResize,
  enableColumnReorder,
  colReorderKey,
}: HeaderCellProps<T>) {
  const sortable = !isDerivedColumnGroup(column) && column.sortable
  const label = column.header !== undefined ? column.header : column.key
  const isGroup = isColumnGroup(column)
  return (
    <div
      className="lfg-header-cell"
      data-reordering={!!colReorderKey}
      data-moving-col={column.key === colReorderKey}
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
      <div className="lfg-header-cell-inner">
        <div
          className="lfg-header-cell-label"
          title={typeof label === 'string' ? label : undefined}
        >
          {label}
        </div>
        {!isGroup &&
          column.sortDirection &&
          (column.sortDirection === SortDirection.Asc ? (
            <SortAscendingIcon className="lfg-header-sort-indicator" />
          ) : (
            <SortDescendingIcon className="lfg-header-sort-indicator" />
          ))}
      </div>
      {enableColumnResize && (
        <div
          className="lfg-header-grip-resizer"
          role="button"
          aria-labelledby="resize handle"
          onPointerDown={e => {
            e.stopPropagation()
            mgr.columnResizePlugin?.onPointerDown(e.nativeEvent, column, colAreaPos)
          }}
        />
      )}
    </div>
  )
}
