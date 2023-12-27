import {
  DerivedColumn,
  DerivedRow,
  GridManager,
  ItemId,
  RowStateItem,
  StateSetter,
} from '@lightfin/datagrid'

import type { N } from './types'
import { DefaultCellComponent } from './DefaultCellComponent'

interface CellProps<T> {
  mgr: GridManager<T, N>
  column: DerivedColumn<T, N>
  // Passing in item instead of `row: DerivedRow<T>` means that if data changes
  // and rows are re-derived, only cells with a changed item will re-render.
  row: DerivedRow<T>
  rowStateItem: RowStateItem<any> | undefined
  setRowState?: StateSetter<any>
  pinnedX: boolean
  pinnedY: boolean
  colReorderKey?: ItemId
  enableColumnReorder?: boolean
  selected: boolean
  selectionStart: boolean
  width: number
  height: number
  zIndex?: number
}

export function Cell<T>({
  mgr,
  column,
  row,
  rowStateItem,
  setRowState,
  pinnedX,
  pinnedY,
  colReorderKey,
  selected,
  selectionStart,
  enableColumnReorder,
  width,
  height,
  zIndex,
}: CellProps<T>) {
  return (
    <div
      role="cell"
      class="lg-cell"
      data-pinned-x={pinnedX}
      data-pinned-y={pinnedY}
      data-selected={selected}
      data-selection-start={selectionStart}
      data-reordering={!!colReorderKey}
      data-moving-col={column.key === colReorderKey}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `translateX(${column.offset}px)`,
        'z-index': zIndex,
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
      {column.cellComponent ? (
        column.cellComponent({
          column,
          item: row.item,
          rowIndex: row.rowIndex,
          rowStateItem,
          setRowState,
        })
      ) : (
        <DefaultCellComponent column={column} item={row.item} />
      )}
    </div>
  )
}
