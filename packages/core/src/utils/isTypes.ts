import {
  Column,
  ColumnGroup,
  DerivedColResult,
  DerivedColumnGroup,
  DerivedColumnOrGroup,
  DerivedRowResult,
} from '../types'

export function isColResult<T, R>(
  colOrRowResult: DerivedColResult<T, R> | DerivedRowResult<T>
): colOrRowResult is DerivedColResult<T, R> {
  if ((colOrRowResult as DerivedColResult<T, R>).items) {
    return true
  }
  return false
}
export function isRowResult<T, R>(
  colOrRowResult: DerivedColResult<T, R> | DerivedRowResult<T>
): colOrRowResult is DerivedRowResult<T> {
  return !isColResult(colOrRowResult)
}

export function isColumnGroup<T, R>(
  column: ColumnGroup<T, R> | Column<T, R>
): column is ColumnGroup<T, R> {
  return Array.isArray((column as ColumnGroup<T, R>).children)
}

export function isDerivedColumnGroup<T, R>(
  column: DerivedColumnOrGroup<T, R>
): column is DerivedColumnGroup<T, R> {
  return Array.isArray((column as DerivedColumnGroup<T, R>).children)
}
