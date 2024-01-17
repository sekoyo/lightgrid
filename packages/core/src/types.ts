/** Sort direction passed to `column.createSortComparator` */
export enum SortDirection {
  Desc = -1,
  Asc = 1,
}

/** Value for column.pin */
export type ColumnPin = 'start' | 'end'

/** Value for column.contentAlign */
export type ContentAlign = 'start' | 'end'

/**
 * The source that is requesting a column value, which can be a cell, the
 * clipboard, or the default sorting function.
 */
export enum ValueSource {
  /** During a cell rendering operation */
  Cell,
  /** During a copy to clipboard operation */
  Clipboard,
  /** During a sorting operation */
  Sort,
}

/** The type for column keys and row IDs. */
export type ItemId = string | number

/**
 * A column group definition which consists of a header and one or more columns
 * or sub groups in the children array.
 */
export interface ColumnGroup<T, N, S = unknown> {
  /** A unique key for this column group. Do not use an array index. */
  key: ItemId
  /** The header text or node for this column group. */
  header?: N
  /** The columns and groups under this group. */
  children: GroupedColumns<T, N, S>
  /**
   * Pin this column to the left (`"start"`) or right (`"end"`) if you wish it
   * to always be visible even if the user scrolls.
   */
  pin?: ColumnPin
  /**
   * Can be used when you just want to align content instead of a custom
   * `header`.
   */
  contentAlign?: ContentAlign
}

/**
 * The sort comparator function returned by column.createSortComparator used to
 * sort the column. If none is provided a default comparator is used.
 */
export type Comparator<T> = (a: T, b: T) => number

export type FilterFn<T> = (item: T, filerValue: any) => boolean

export interface CellComponentProps<T, N, S = unknown> {
  column: DerivedColumn<T, N>
  item: T
  rowStateItem: RowStateItem<S> | undefined
  setRowState: StateSetter<RowState<S>> | undefined
  rowIndex: number
}

/** The column definition for each column in the `columns` prop. */
export interface Column<T, N, S = unknown> {
  /** A unique key for this column. Do not use an array index. */
  key: ItemId
  /** The header text or node for this column. */
  header?: N
  /**
   * The column width. Can be `"10px"` or `10` (pixels), or `"0.5fr"`
   * (fractional unit). Defaults to `"1fr"`.
   */
  width?: number | string
  /** The minimum width this column can be, in pixels. Defaults to `100`. */
  minWidth?: number
  /**
   * Should return the value for the cell. You can return different values
   * depending on the `source` param.
   */
  getValue: (row: T, source: ValueSource) => any
  /**
   * Whether this column can be sorted or not. You must implement the
   * `onColumnsChange` prop for sorting to work.
   */
  sortable?: boolean
  /** The current sort direction of this column (or undefined for no sort) */
  sortDirection?: SortDirection
  /**
   * Given the sort direction, returns a custom comparator function. If not
   * defined then the default comparator is used.
   */
  createSortComparator?: (sortDirection: SortDirection) => Comparator<T>
  /**
   * The sort priority when multiple columns are sorted. Lower is higher
   * priority. By default it's based on the order that columns are clicked.
   */
  sortPriority?: number
  /**
   * Pin this column to the left (`"start"`) or right (`"end"`) if you wish it
   * to always be visible even if the user scrolls.
   */
  pin?: ColumnPin
  /**
   * A function given a the current column and row item returns the cell node to
   * be rendered. If not specified will try to render the result of `getValue`
   * as a string.
   */
  cellComponent?: (props: CellComponentProps<T, N, S>) => N
  /**
   * Can be used when you just want to align content instead of a custom
   * `cellComponent` and `header`.
   */
  contentAlign?: ContentAlign
  /**
   * A component for filtering data on this column (e.g. a text input). Input
   * state should be local (useState) and when you are ready to apply the filter
   * (e.g. after a debounce), call `onChange` which will trigger a
   * `onFiltersChange(columnKey, <value>)` callback on the DataGrid.
   */
  filterComponent?: (onChange: (value: any) => void) => N
  /**
   * When a filterComponent calls `onChange`, `onFiltersChange` prop receives
   * `(column, value)`. So you can use `column.filterFn` to filter the item.
   * Returning `false` means filter the item out of the datagrid.
   */
  filterFn?: FilterFn<T>
  /** Span over adjacent columns. -1 means span the whole grid. */
  colSpan?: (item: T) => number
  /** Span over adjacent rows. -1 means span the whole grid. */
  rowSpan?: (item: T) => number
}

export type ColumnOrGroup<T, N, S = unknown> =
  | ColumnGroup<T, N, S>
  | Column<T, N, S>

/**
 * An array which can contain a mix of columns which can also be nested under
 * groups
 */
export type GroupedColumns<T, N, S = unknown> = ColumnOrGroup<T, N, S>[]

// Derived for internal use
export interface DerivedColumnGroup<T, N, S = unknown>
  extends Omit<ColumnGroup<T, N, S>, 'children'> {
  children: GroupedDerivedColumns<T, N, S>
  size: number
  offset: number
  headerColSpan: number
  headerRowSpan: number
  colIndex: number
  rowIndex: number
}

export interface DerivedColumn<T, N, S = unknown> extends Column<T, N, S> {
  size: number
  offset: number
  headerColSpan: number
  headerRowSpan: number
  colIndex: number
  rowIndex: number
}

export type DerivedColumnOrGroup<T, N, S = unknown> =
  | DerivedColumnGroup<T, N, S>
  | DerivedColumn<T, N>

export type GroupedDerivedColumns<T, N, S = unknown> = DerivedColumnOrGroup<
  T,
  N,
  S
>[]

export interface DerivedColResult<T, N, S = unknown> {
  areaPos: AreaPos
  itemsWithGrouping: GroupedDerivedColumns<T, N, S>
  items: DerivedColumn<T, N>[]
  topLevelByIndex: GroupedDerivedColumns<T, N, S>
  size: number
  startOffset: number
  startIndexOffset: number
  firstWithSize: boolean
}

export interface DerivedColsResult<T, N, S = unknown> {
  start: DerivedColResult<T, N, S>
  middle: DerivedColResult<T, N, S>
  end: DerivedColResult<T, N, S>
  size: number
  itemCount: number
  headerRowCount: number
  hasFilters: boolean
}

/**
 * What you should return in the `getRowMeta` function prop to describe the
 * row's height and optionally if it has a row details section.
 */
export interface RowMeta {
  /**
   * The height of the row in pixels. When `getRowMeta` is not defined row
   * heights will default to `40`.
   */
  height: number
  /** Optionally return true if this row has a row details section. */
  hasDetails?: boolean
}

/**
 * The row details meta returned in the `getRowDetailsMeta` function prop for
 * providing the the row details height in pixels. If `getRowDetailsMeta` isn't
 * specified, detail rows will be 160px.
 */
export interface RowDetailsMeta {
  /** The row details section height in pixels. */
  height: number
}

/** The signature of the `getRowMeta` function prop. */
export type GetRowMeta<T> = (item: T) => RowMeta
/** The signature of the `getRowDetailsMeta` function prop. */
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

/** The row state to specify which rows have their details section expanded. */
export type RowStateItem<S = unknown> = S & {
  /** True if the row details are expanded. */
  expanded?: boolean
}

/** Row state object keyed by row ID. */
export type RowState<S = unknown> = Record<ItemId, RowStateItem<S>>

/**
 * Signature of `onFiltersChange` callback which is called when a
 * `filterComponent` in a column calls `onChange(<value>)`.
 */
export type OnFiltersChange<T, N> = (
  column: DerivedColumn<T, N>,
  value: any
) => void

/** Signature of function which returns a unique row ID per row. */
export type GetRowId<T> = (item: T) => ItemId

/** Renders the row details and returns a node. */
export type RenderRowDetails<T, N> = (item: T) => N

export type GridRange = [startIndex: number, endIndex: number]

export interface CellSelection {
  rowRange: GridRange
  colRange: GridRange
}

export interface CellPosition {
  colIndex: number
  rowIndex: number
}

export enum BodyAreaId {
  TopStart,
  TopMiddle,
  TopEnd,
  MainStart,
  MainMiddle,
  MainEnd,
  BottomStart,
  BottomMiddle,
  BottomEnd,
}

export interface BodyAreaDesc<T, N> {
  id: string
  windowX: number
  windowY: number
  windowWidth: number
  windowHeight: number
  width: number
  height: number
  colResult: DerivedColResult<T, N>
  rowResult: DerivedRowResult<T>
  pinnedX: boolean
  pinnedY: boolean
  lastY: boolean
}

export interface HeaderAreaDesc<T, N> {
  columns: GroupedDerivedColumns<T, N>
  flatColumns: DerivedColumn<T, N>[]
  colAreaPos: AreaPos
  headerRowCount: number
  headerRowHeight: number
  filterRowHeight: number
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

type Dispatch<A> = (value: A) => void
export type StateSetter<S> = Dispatch<S | ((prevState: S) => S)>
