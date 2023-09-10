import { CellComponentProps, ValueSource } from '@lightfin/datagrid'
import { R } from './types'

export function DefaultCellComponent<T>({ item, column }: CellComponentProps<T, N>) {
  return <div className="lfg-default-cell">{column.getValue(item, ValueSource.Cell)}</div>
}
