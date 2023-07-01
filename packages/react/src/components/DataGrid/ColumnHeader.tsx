import {
  AreaPos,
  DerivedColumn,
  DerivedColumnGroup,
  GridManager,
} from '@lightfin/datagrid'
import { R } from './types'

interface ColumnHeaderProps<T> {
  mgr: GridManager<T, React.ReactNode>
  column: DerivedColumnGroup<T, R> | DerivedColumn<T, R>
  colAreaPos: AreaPos
  headerRowHeight: number
  enableColumnResize?: boolean
}

export function ColumnHeader<T>({
  mgr,
  column,
  colAreaPos,
  headerRowHeight,
  enableColumnResize,
}: ColumnHeaderProps<T>) {
  return (
    <div
      className="lfg-column-header"
      style={{
        width: column.size,
        height: column.rowSpan * headerRowHeight,
        transform: `translate(${column.offset}px, ${
          column.rowIndex * headerRowHeight
        }px)`,
      }}
    >
      {column.header || column.key}
      {enableColumnResize && (
        <div
          className="lfg-column-resizer"
          role="button"
          aria-labelledby="resize handle"
          onPointerDown={e =>
            mgr.columnResizePlugin.onPointerDown(e.nativeEvent, column, colAreaPos)
          }
        />
      )}
    </div>
  )
}
