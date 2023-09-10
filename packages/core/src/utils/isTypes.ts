import {
  Column,
  ColumnGroup,
  DerivedColResult,
  DerivedColumnGroup,
  DerivedColumnOrGroup,
  DerivedRowResult,
} from '../types'

export function isColResult<T, N>(
  colOrRowResult: DerivedColResult<T, N> | DerivedRowResult<T>
): colOrRowResult is DerivedColResult<T, N> {
  if ((colOrRowResult as DerivedColResult<T, N>).items) {
    return true
  }
  return false
}
export function isRowResult<T, N>(
  colOrRowResult: DerivedColResult<T, N> | DerivedRowResult<T>
): colOrRowResult is DerivedRowResult<T> {
  return !isColResult(colOrRowResult)
}

export function isColumnGroup<T, N>(
  column: ColumnGroup<T, N> | Column<T, N>
): column is ColumnGroup<T, N> {
  return Array.isArray((column as ColumnGroup<T, N>).children)
}

export function isDerivedColumnGroup<T, N>(
  column: DerivedColumnOrGroup<T, N>
): column is DerivedColumnGroup<T, N> {
  return Array.isArray((column as DerivedColumnGroup<T, N>).children)
}
