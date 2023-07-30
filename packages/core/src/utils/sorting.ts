import { Comparator, SortDirection } from '../types'

export function getNextSortDirection(currSortDirection?: SortDirection) {
  switch (currSortDirection) {
    case SortDirection.Desc:
      return SortDirection.Asc
    case SortDirection.Asc:
      return undefined
    default:
      return SortDirection.Desc
  }
}

// Faster than String.localeCompare
let collator: Intl.Collator
let collatorLocale: string
function localeCompare(a: string, b: string) {
  const navLang = navigator?.language || 'en-US'
  if (!collator || navLang !== collatorLocale) {
    collator = new Intl.Collator(navigator?.language || 'en-US')
    collatorLocale = navLang
  }
  return collator.compare(a, b)
}

export const createDefaultSortComparator =
  <T>(getValue: (data: T) => unknown, sortDirection: SortDirection) =>
  (a: T, b: T) => {
    const va = getValue(a)
    const vb = getValue(b)
    return typeof va === 'string' && typeof vb === 'string'
      ? sortDirection * localeCompare(va, vb)
      : sortDirection * (Number(va) - Number(vb))
  }

export const createMultiSort =
  <T>(comparators: Comparator<T>[]) =>
  (a: T, b: T) =>
    comparators.reduce((r, s) => r || s(a, b), 0)
