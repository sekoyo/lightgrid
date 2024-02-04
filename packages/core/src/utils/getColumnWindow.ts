import { getColOffsetValue } from '../constants'
import { DerivedColumn, GridRange } from '../types'
import { binarySearch } from './binarySearch'
import { expoSearchGreater } from './expoSearchGreater'

const MAX_OVERSCAN = 300

export function getColumnWindow<T, N>(
  viewportSize: number,
  scrollLeft: number,
  columns: DerivedColumn<T, N>[]
): GridRange {
  const overscan = Math.min(viewportSize / 2, MAX_OVERSCAN)
  const xStart = Math.max(0, scrollLeft - overscan)
  const xEnd = scrollLeft + viewportSize + overscan

  const startIndex = binarySearch(columns, xStart, getColOffsetValue)

  // Exponential search so we can limit the binary search range
  const upTo = expoSearchGreater(columns, xEnd, getColOffsetValue, 8)
  const endIndex = binarySearch(
    columns,
    xEnd,
    getColOffsetValue,
    startIndex,
    upTo
  )

  return [startIndex, endIndex]
}
