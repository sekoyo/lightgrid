import { DerivedRow } from '../types'
import { getRowOffsetValue } from '../constants'
import { binarySearch } from './binarySearch'
import { expoSearchGreater } from './expoSearchGreater'

const MAX_OVERSCAN = 150

export function getRowWindow<T>(
  viewportSize: number,
  scrollTop: number,
  rows: DerivedRow<T>[]
) {
  const overscan = Math.min(viewportSize / 2, MAX_OVERSCAN)
  const xStart = Math.max(0, scrollTop - overscan)
  const xEnd = scrollTop + viewportSize + overscan

  const startIndex = binarySearch(rows, xStart, getRowOffsetValue)

  // Exponential search so we can limit the binary search range
  const upTo = expoSearchGreater(rows, xEnd, getRowOffsetValue, 8)
  const endIndex = binarySearch(rows, xEnd, getRowOffsetValue, startIndex, upTo)

  return [startIndex, endIndex]
}
