import {
  AreaPos,
  type DerivedColResult,
  type DerivedColsResult,
  type DerivedColumn,
  type DerivedColumnGroup,
  type DerivedRow,
  type RowMeta,
} from './types'

export const DEFAULT_HEADER_ROW_HEIGHT = 40
export const DEFAULT_FILTER_ROW_HEIGHT = 40
export const DEFAULT_ROW_HEIGHT = 40
export const DEFAULT_ROW_DETAILS_HEIGHT = 160

export const DEFAULT_ROW_META: RowMeta = { height: DEFAULT_ROW_HEIGHT }
export const DEFAULT_GET_ROW_META = () => DEFAULT_ROW_META

export const DEFAULT_GET_ROW_DETAILS_META = (item: any) => ({
  height: DEFAULT_ROW_DETAILS_HEIGHT,
  details: item,
})

export const canUseDOM = Boolean(
  typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
)

export const getColumnOffset = <T, N>(
  r: DerivedColumnGroup<T, N> | DerivedColumn<T, N>
) => r.offset
export const getRowOffset = <T>(r: DerivedRow<T>) => r.offset

export const EMPTY_DERIVED_COL_RESULT: DerivedColResult<any, any> = {
  areaPos: AreaPos.Start,
  itemsWithGrouping: [],
  items: [],
  topLevelByIndex: [],
  size: 0,
  startOffset: 0,
  startIndexOffset: 0,
  firstWithSize: false,
}

export const EMPTY_DERIVED_COLS_RESULT: DerivedColsResult<any, any> = {
  start: { ...EMPTY_DERIVED_COL_RESULT, areaPos: AreaPos.Start },
  middle: { ...EMPTY_DERIVED_COL_RESULT, areaPos: AreaPos.Middle },
  end: { ...EMPTY_DERIVED_COL_RESULT, areaPos: AreaPos.End },
  size: 0,
  itemCount: 0,
  headerRowCount: 0,
  hasFilters: false,
}
