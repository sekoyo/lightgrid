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

export interface RowMeta {
  height: number
  hasDetails?: boolean
}

export interface RowDetailsMeta {
  height: number
}

export type GetRowMeta<T> = (item: T) => RowMeta
export type GetRowDetailsMeta<T> = (item: T) => RowDetailsMeta

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
