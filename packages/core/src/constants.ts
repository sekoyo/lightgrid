import type { RowMeta } from './types'
import type {
  DerivedColResult,
  DerivedColsResult,
  DerivedRowResult,
  DerivedRowsResult,
} from './utils'

export const defaultHeaderRowHeight = 32
export const defaultRowHeight = 32
export const defaultRowDetailsHeight = 160

export const defaultRowMeta: RowMeta = { height: defaultRowHeight }
export const defaultGetRowMeta = () => defaultRowMeta

export const defaultGetRowDetailsMeta = (item: any) => ({
  height: defaultRowDetailsHeight,
  details: item,
})

export const canUseDOM = Boolean(
  typeof window !== 'undefined' && window.document && window.document.createElement
)

export const emptyDerivedColResult: DerivedColResult<any, any> = {
  itemsWithGrouping: [],
  items: [],
  size: 0,
  startOffset: 0,
  startIndexOffset: 0,
}

export const emptyDerivedColsResult: DerivedColsResult<any, any> = {
  start: emptyDerivedColResult,
  middle: emptyDerivedColResult,
  end: emptyDerivedColResult,
  size: 0,
  headerRows: 0,
  totalItems: 0,
}

export const emptyDerivedRowResult: DerivedRowResult<any> = {
  items: [],
  itemDetails: [],
  size: 0,
  startOffset: 0,
  startIndexOffset: 0,
}

export const emptyDerivedRowsResult: DerivedRowsResult<any> = {
  start: emptyDerivedRowResult,
  middle: emptyDerivedRowResult,
  end: emptyDerivedRowResult,
  totalItems: 0,
}
