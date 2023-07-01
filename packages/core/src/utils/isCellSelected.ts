import { CellSelection } from '../types'

export function isCellSelected(
  colIndex: number,
  rowIndex: number,
  selection?: CellSelection
) {
  return Boolean(
    selection &&
      selection.colRange[0] <= colIndex &&
      selection.colRange[1] >= colIndex &&
      selection.rowRange[0] <= rowIndex &&
      selection.rowRange[1] >= rowIndex
  )
}
