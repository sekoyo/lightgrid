export type SortDirection = 'none' | 'asc' | 'desc'
export type ColumnPin = 'start' | 'end'
export type ValueSource = 'render' | 'clipboard'

// Raw from user
export interface ColumnGroup<T, R> {
  key: string | number
  header?: R
  children: GroupedColumns<T, R>
  pin?: ColumnPin
}

export interface Column<T, R> {
  key: string | number
  header?: R
  width?: number | string
  minWidth?: number
  getValue: (row: T, source?: ValueSource) => any
  sortDirection?: SortDirection
  onSort?: (direction: SortDirection) => void
  filter?: R
  pin?: ColumnPin
  cellComponent?: (props: CellComponentProps<T, R>) => R
}

export type GroupedColumns<T, R> = (ColumnGroup<T, R> | Column<T, R>)[]

// Derived for internal use
export interface DerivedColumnGroup<T, R> extends ColumnGroup<T, R> {
  children: DerivedGroupColumns<T, R>
  size: number
  offset: number
  rowSpan: number
  colIndex: number
  rowIndex: number
}

export interface DerivedColumn<T, R> extends Column<T, R> {
  size: number
  offset: number
  rowSpan: number
  colIndex: number
  rowIndex: number
}

export type DerivedGroupColumns<T, R> = (DerivedColumnGroup<T, R> | DerivedColumn<T, R>)[]

export interface DerivedColResult<T, R> {
  itemsWithGrouping: DerivedGroupColumns<T, R>
  items: DerivedColumn<T, R>[]
  size: number
  startOffset: number
  startIndexOffset: number
  firstWithSize: boolean
}

export interface DerivedColsResult<T, R> {
  start: DerivedColResult<T, R>
  middle: DerivedColResult<T, R>
  end: DerivedColResult<T, R>
  size: number
  headerRows: number
}

export interface RowMeta {
  height: number
  hasDetails?: boolean
}

export interface RowDetailsMeta {
  height: number
}

export type GetRowMeta<T> = (item: T) => RowMeta
export type GetRowDetailsMeta<T> = (item: T) => RowDetailsMeta

// Derived for internal use
export interface DerivedRow<T> {
  item: T
  rowId: string | number
  hasDetails?: boolean
  size: number
  offset: number
  rowIndex: number
}

export interface DerivedDetailRow<T> {
  item: T
  rowId: string | number
  size: number
  offset: number
}

export interface DerivedRowResult<T> {
  items: DerivedRow<T>[]
  itemDetails: DerivedDetailRow<T>[]
  size: number
  startOffset: number
  startIndexOffset: number
}

export interface DerivedRowsResult<T> {
  start: DerivedRowResult<T>
  middle: DerivedRowResult<T>
  end: DerivedRowResult<T>
}

export interface CellComponentProps<T, R> {
  item: T
  column: DerivedColumn<T, R>
}

export interface RowStateItem {
  detailsExpanded?: boolean
}

export type RowState = Record<string | number, RowStateItem>

export type OnRowStateChange = (itemId: string | number, item: RowStateItem) => void

export type GetRowId<T> = (item: T) => string | number

export type RenderRowDetails<T, R> = (item: T) => R

export type GridRange = [startIndex: number, endIndex: number]

export interface CellSelection {
  rowRange: GridRange
  colRange: GridRange
}

export interface CellPosition {
  colIndex: number
  rowIndex: number
}

export interface GridArea<T, R> {
  id: string
  windowX: number
  windowY: number
  windowWidth: number
  windowHeight: number
  width: number
  height: number
  colResult: DerivedColResult<T, R>
  rowResult: DerivedRowResult<T>
  pinnedX: boolean
  pinnedY: boolean
}

export type Point = { x: number; y: number }
export type AreaRect = { x: number; y: number; width: number; height: number }
