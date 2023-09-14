import { DerivedColumn, ValueSource } from '@lightfin/datagrid'
import { N } from './types'

export interface CellComponentProps<T, N> {
  column: DerivedColumn<T, N>
  item: T
}

export function DefaultCellComponent<T>({ item, column }: CellComponentProps<T, N>) {
  return <div className="lfg-default-cell">{column.getValue(item, ValueSource.Cell)}</div>
}
