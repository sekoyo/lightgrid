import { DerivedColumn, DerivedColumnGroup } from '@lightfin/datagrid'
import { R } from './types'

interface ColumnHeaderProps<T> {
  column: DerivedColumnGroup<T, R> | DerivedColumn<T, R>
  headerRowHeight: number
}

export function ColumnHeader<T>({ column, headerRowHeight }: ColumnHeaderProps<T>) {
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
    </div>
  )
}
