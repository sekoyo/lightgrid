import { DerivedColumn, ValueSource } from '@lightfin/datagrid'
import { N } from './types'

export interface CellComponentProps<T, N> {
  column: DerivedColumn<T, N>
  item: T
}

export function DefaultCellComponent<T>({ item, column }: CellComponentProps<T, N>) {
  const value = column.getValue(item, ValueSource.Cell)
  return (
    <div
      className="lfg-default-cell"
      title={typeof value === 'string' ? value : undefined}
    >
      {value}
    </div>
  )
}
