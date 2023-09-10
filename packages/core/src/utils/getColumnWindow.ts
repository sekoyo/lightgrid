import { getColumnOffset } from '../constants'
import { GroupedDerivedColumns, GridRange } from '../types'
import { binarySearch } from './binarySearch'
import { expoSearchGreater } from './expoSearchGreater'

const MAX_OVERSCAN = 300

export function getColumnWindow<T, N>(
  viewportSize: number,
  scrollLeft: number,
  columns: GroupedDerivedColumns<T, N>
): GridRange {
  const overscan = Math.min(viewportSize / 2, MAX_OVERSCAN)
  const xStart = Math.max(0, scrollLeft - overscan)
  const xEnd = scrollLeft + viewportSize + overscan

  const startIndex = binarySearch(columns, xStart, getColumnOffset)

  // Exponential search so we can limit the binary search range
  const upTo = expoSearchGreater(columns, xEnd, getColumnOffset, 8)
  const endIndex = binarySearch(columns, xEnd, getColumnOffset, startIndex, upTo)

  return [startIndex, endIndex]
}
