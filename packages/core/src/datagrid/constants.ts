import { RowMeta } from './types'

export const DEFAULT_HEADER_ROW_HEIGHT = 32
export const DEFAULT_ROW_HEIGHT = 32
export const DEFAULT_ROW_DETAILS_HEIGHT = 160

export const DEFAULT_ROW_META: RowMeta = { height: DEFAULT_ROW_HEIGHT }
export const DEFAULT_GET_ROW_META = () => DEFAULT_ROW_META

export const DEFAULT_GET_ROW_DETAILS_META = (item: any) => ({
  height: DEFAULT_ROW_DETAILS_HEIGHT,
  details: item,
})

export const canUseDOM = Boolean(
  typeof window !== 'undefined' && window.document && window.document.createElement
)
