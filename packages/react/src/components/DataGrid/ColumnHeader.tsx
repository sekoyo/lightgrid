import { AreaPos, DerivedColumnOrGroup, GridManager, ItemId } from '@lightfin/datagrid'
import { R } from './types'

interface ColumnHeaderProps<T> {
  mgr: GridManager<T, React.ReactNode>
  column: DerivedColumnOrGroup<T, R>
  colAreaPos: AreaPos
  headerRowHeight: number
  enableColumnResize?: boolean
  enableColumnReorder?: boolean
  colReorderKey?: ItemId
}

export function ColumnHeader<T>({
  mgr,
  column,
  colAreaPos,
  headerRowHeight,
  enableColumnResize,
  enableColumnReorder,
  colReorderKey,
}: ColumnHeaderProps<T>) {
  return (
    <div
      className="lfg-column-header"
      data-reordering={!!colReorderKey}
      data-moving-col={column.key === colReorderKey}
      style={{
        width: column.size,
        height: column.rowSpan * headerRowHeight,
        transform: `translate(${column.offset}px, ${
          column.rowIndex * headerRowHeight
        }px)`,
      }}
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
      {column.header || column.key}
      {enableColumnResize && (
        <div
          className="lfg-column-resizer"
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
