import type { DerivedColumnOrGroup } from '@lightfin/datagrid'
import type { N } from './types'

interface FilterCellProps<T> {
  column: DerivedColumnOrGroup<T, N>
  filterRowHeight: number
  children?: React.ReactNode
}

export function FilterCell<T>({ column, filterRowHeight, children }: FilterCellProps<T>) {
  return (
    <div
      className="lg-header-filter"
      style={{
        width: column.size,
        height: filterRowHeight,
        transform: `translateX(${column.offset}px)`,
      }}
    >
      {children}
    </div>
  )
}
