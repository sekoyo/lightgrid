import { DerivedColumn, DerivedColumnGroup } from '@lightfin/datagrid'
import { R } from './types'

interface ColumnHeaderProps<T> {
  column: DerivedColumnGroup<T, R> | DerivedColumn<T, R>
  headerRowHeight: number
  isTopEdge?: boolean
  isLeftEdge?: boolean
  isRightEdge?: boolean
}

export function ColumnHeader<T>({
  column,
  headerRowHeight,
  isTopEdge,
  isLeftEdge,
  isRightEdge,
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
      data-top-edge={isTopEdge}
      data-left-edge={isLeftEdge}
      data-right-edge={isRightEdge}
    >
      {column.header || column.key}
    </div>
  )
}
