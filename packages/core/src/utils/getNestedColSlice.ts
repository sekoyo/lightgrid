import type { GroupedDerivedColumns } from '../types'
import { binarySearch } from './binarySearch'

export function getNestedColSlice<T, R>(
  columns: GroupedDerivedColumns<T, R>,
  start: number,
  end: number
) {
  const startIdx = binarySearch(columns, start, c => c.colIndex)
  const endIdx = binarySearch(columns, end, c => c.colIndex)
  return columns.slice(startIdx, endIdx)
}
