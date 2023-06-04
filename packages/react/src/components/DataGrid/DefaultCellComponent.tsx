import { CellComponentProps } from '@lightfin/datagrid'
import { R } from './types'

export function DefaultCellComponent<T>({ item, column }: CellComponentProps<T, R>) {
  return <div className="lfg-default-cell">{column.getValue(item)}</div>
}
