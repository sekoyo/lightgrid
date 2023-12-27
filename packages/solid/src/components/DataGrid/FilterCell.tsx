import { type JSX } from 'solid-js'
import type { DerivedColumnOrGroup } from '@lightfin/datagrid'
import type { N } from './types'

interface FilterCellProps<T> {
  column: DerivedColumnOrGroup<T, N>
  filterRowHeight: number
  children?: JSX.Element
}

export function FilterCell<T>({ column, filterRowHeight, children }: FilterCellProps<T>) {
  return (
    <div
      class="lg-header-filter"
      style={{
        width: `${column.size}px`,
        height: `${filterRowHeight}px`,
        transform: `translateX(${column.offset}px)`,
      }}
    >
      {children}
    </div>
  )
}
