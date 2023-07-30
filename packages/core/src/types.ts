export enum SortDirection {
  Desc = -1,
  Asc = 1,
}
export type ColumnPin = 'start' | 'end'
export enum ValueSource {
  Render,
  Clipboard,
  Sort,
}

export type ItemId = string | number

// Raw from user
export interface ColumnGroup<T, R> {
  key: ItemId
  header?: R
  children: GroupedColumns<T, R>
  pin?: ColumnPin
}

export type Comparator<T> = (a: T, b: T) => number

export interface Column<T, R> {
  key: ItemId
  header?: R
  width?: number | string
  minWidth?: number
  getValue: (row: T, source?: ValueSource) => any
  sortable?: boolean
  sortDirection?: SortDirection
  createSortComparator?: (sortDirection: SortDirection) => Comparator<T>
  sortPriority?: number
  filter?: R
  pin?: ColumnPin
  cellComponent?: (props: CellComponentProps<T, R>) => R
}

export type ColumnOrGroup<T, R> = ColumnGroup<T, R> | Column<T, R>

export type GroupedColumns<T, R> = ColumnOrGroup<T, R>[]

// Derived for internal use
export interface DerivedColumnGroup<T, R> extends ColumnGroup<T, R> {
  children: GroupedDerivedColumns<T, R>
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

export type DerivedColumnOrGroup<T, R> = DerivedColumnGroup<T, R> | DerivedColumn<T, R>

export type GroupedDerivedColumns<T, R> = DerivedColumnOrGroup<T, R>[]

export interface DerivedColResult<T, R> {
  areaPos: AreaPos
  itemsWithGrouping: GroupedDerivedColumns<T, R>
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
  itemCount: number
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
  rowId: ItemId
  hasDetails?: boolean
  size: number
  offset: number
  rowIndex: number
}

export interface DerivedDetailRow<T> {
  item: T
  rowId: ItemId
  size: number
  offset: number
}

export interface DerivedRowResult<T> {
  areaPos: AreaPos
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
  size: number
  itemCount: number
}

export interface CellComponentProps<T, R> {
  item: T
  column: DerivedColumn<T, R>
}

export interface RowStateItem {
  detailsExpanded?: boolean
}

export type RowState = Record<ItemId, RowStateItem>

export type OnRowStateChange = (itemId: ItemId, item: RowStateItem) => void

export type GetRowId<T> = (item: T) => ItemId

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

export interface BodyAreaDesc<T, R> {
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

export interface HeaderAreaDesc<T, R> {
  columns: GroupedDerivedColumns<T, R>
  colAreaPos: AreaPos
  headerRowHeight: number
  left: number
  width: number
  height: number
}

export enum AreaPos {
  Start,
  Middle,
  End,
}

export type Point = { x: number; y: number }
export type AreaRect = { x: number; y: number; width: number; height: number }

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}
