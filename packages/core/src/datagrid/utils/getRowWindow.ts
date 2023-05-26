import { DerivedRow } from '../types'
import { binarySearch } from './binarySearch'
import { expoSearchGreater } from './expoSearchGreater'

const MAX_OVERSCAN = 150

export function getRowWindow<T>(
  viewportSize: number,
  scrollTop: number,
  rows: DerivedRow<T>[]
) {
  const getValue = (r: DerivedRow<T>) => r.offset
  const overscan = Math.min(viewportSize / 2, MAX_OVERSCAN)
  const xStart = Math.max(0, scrollTop - overscan)
  const xEnd = scrollTop + viewportSize + overscan

  const startIndex = binarySearch(rows, xStart, getValue)

  // Exponential search so we can limit the binary search range
  const upTo = expoSearchGreater(rows, xEnd, getValue, 8)
  const endIndex = binarySearch(rows, xEnd, getValue, startIndex, upTo)

  return [startIndex, endIndex]
}
