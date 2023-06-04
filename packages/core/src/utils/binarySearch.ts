export function binarySearch<T = any>(
  items: T[],
  searchValue: number,
  getValue: (item: T) => number,
  from = 0,
  to = items.length - 1
) {
  let lo = from
  let hi = to

  while (lo <= hi) {
    const mi = (lo + hi) >>> 1
    const value = getValue(items[mi])

    if (searchValue < value) {
      hi = mi - 1
    } else if (searchValue > value) {
      lo = mi + 1
    } else {
      return mi
    }
  }

  return lo > 0 ? lo - 1 : 0
}
