import { memo } from 'react'
import {
  DerivedColumn,
  GridManager,
  ItemId,
  RowStateItem,
  StateSetter,
} from '@lightfin/datagrid'

import type { N } from './types'
import { DefaultCellComponent } from './DefaultCellComponent'

interface CellProps<T> {
  mgr: GridManager<T, React.ReactNode>
  column: DerivedColumn<T, N>
  // Passing in item instead of `row: DerivedRow<T>` means that if data changes
  // and rows are re-derived, only cells with a changed item will re-render.
  item: T
  rowStateItem: RowStateItem<any> | undefined
  setRowState?: StateSetter<any>
  pinnedX: boolean
  pinnedY: boolean
  colReorderKey?: ItemId
  enableColumnReorder?: boolean
  selected: boolean
  selectionStart: boolean
  width: number
  zIndex?: number
}

export function CellNoMemo<T>({
  mgr,
  column,
  item,
  rowStateItem,
  setRowState,
  pinnedX,
  pinnedY,
  colReorderKey,
  selected,
  selectionStart,
  enableColumnReorder,
  width,
  zIndex,
}: CellProps<T>) {
  return (
    <div
      role="cell"
      className="lg-cell"
      data-pinned-x={pinnedX}
      data-pinned-y={pinnedY}
      data-selected={selected}
      data-selection-start={selectionStart}
      data-reordering={!!colReorderKey}
      data-moving-col={column.key === colReorderKey}
      style={{
        width,
        transform: `translateX(${column.offset}px)`,
        zIndex,
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
        column.cellComponent({ column, item, rowStateItem, setRowState })
      ) : (
        <DefaultCellComponent column={column} item={item} />
      )}
    </div>
  )
}

const typedMemo: <T>(c: T) => T = memo
export const Cell = typedMemo(CellNoMemo)
