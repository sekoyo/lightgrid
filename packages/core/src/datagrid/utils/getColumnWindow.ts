import {
  DerivedColumn,
  DerivedColumnGroup,
  DerivedGroupColumns,
  GridRange,
} from '../types'
import { binarySearch } from './binarySearch'
import { expoSearchGreater } from './expoSearchGreater'

const MAX_OVERSCAN = 300

export function getColumnWindow<T, R>(
  viewportSize: number,
  scrollLeft: number,
  columns: DerivedGroupColumns<T, R>
): GridRange {
  const getValue = (r: DerivedColumnGroup<T, R> | DerivedColumn<T, R>) => r.offset
  const overscan = Math.min(viewportSize / 2, MAX_OVERSCAN)
  const xStart = Math.max(0, scrollLeft - overscan)
  const xEnd = scrollLeft + viewportSize + overscan

  const startIndex = binarySearch(columns, xStart, getValue)

  // Exponential search so we can limit the binary search range
  const upTo = expoSearchGreater(columns, xEnd, getValue, 8)
  const endIndex = binarySearch(columns, xEnd, getValue, startIndex, upTo)

  return [startIndex, endIndex]
}
