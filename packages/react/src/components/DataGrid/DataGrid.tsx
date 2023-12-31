'use client'
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type CSSProperties,
} from 'react'
import {
  cls,
  createGridManager,
  darkTheme,
  DEFAULT_GET_ROW_DETAILS_META,
  DEFAULT_GET_ROW_META,
  EMPTY_DERIVED_COLS_RESULT,
  BodyAreaDesc,
  CellSelection,
  CellPosition,
  ColResizeData,
  DerivedColsResult,
  GetRowDetailsMeta,
  GetRowId,
  GetRowMeta,
  HeaderAreaDesc,
  ItemId,
  GroupedColumns,
  OnFiltersChange,
  RenderRowDetails,
  RowState,
  Theme,
  themeToCSSObj,
  StateSetter,
} from '@lightgrid/core'
import '@lightgrid/core/dist/style.css'
import { N } from './types'
import { HeaderArea } from './HeaderArea'
import { GridArea } from './GridArea'

const emptyData: any[] = []
const emptyRowState: RowState<any> = {}
const noop = () => {}
const defaultRowDetailsRenderer = () => (
  <div>Define a `renderRowDetails` to customize this</div>
)

interface DataGridProps<T, S> {
  /** An array of column definitions (required) */
  columns: GroupedColumns<T, N, S>
  /**
   * Required if columns need to change e.g. you have enabled resizing or
   * re-ordering
   */
  onColumnsChange?: (columnns: GroupedColumns<T, N>) => void
  /**
   * The `filterComponent` is passed this via the `onChange` arg to be called
   * when the user changes the value of the filter
   */
  onFiltersChange?: OnFiltersChange<T, N>
  /** The row height of column headers in pixels. Defaults to 40 */
  headerRowHeight?: number
  /** The row height of filter headers in pixels. Defaults to 40 */
  filterRowHeight?: number
  /** Given a row data item should return a unique ID for the row (required) */
  getRowId: GetRowId<T>
  /**
   * An optional function which can return the height of the row, as well as if
   * it has row details. Row height defaults to 40px
   */
  getRowMeta?: GetRowMeta<T>
  /**
   * If a row has row details, this function can return the height of that
   * details row. Row details height defaults to 160px.
   */
  getRowDetailsMeta?: GetRowDetailsMeta<T>
  /** The array of data to render in the datagrid (required) */
  data: T[]
  /**
   * The array of data to render in the datagrid which should be pinned to the
   * top
   */
  pinnedTopData?: T[]
  /**
   * The array of data to render in the datagrid which should be pinned to the
   * bottom.
   */
  pinnedBottomData?: T[]
  /** Row state is required when grouping rows or showing row details */
  rowState?: RowState<S>
  /**
   * A setter for row state passed to cell components so that grouping or row
   * details can be expanded or collapsed. You can also pass custom state to row
   * cells
   */
  setRowState?: StateSetter<RowState<S>>
  /**
   * A function given the row item which should render what goes in the row
   * details area
   */
  renderRowDetails?: RenderRowDetails<T, N>
  /**
   * A custom theme object or the built in `lightTheme` or `darkTheme`. Defaults
   * dark.
   */
  theme?: Theme
  /** Whether to allow sorting by multiple columns or not. Defaults to false. */
  multiSort?: boolean
  /** Whether the user can select cells */
  enableCellSelection?: boolean
  /** Whether the user can resize columns */
  enableColumnResize?: boolean
  /** Whether the user can re-order columns */
  enableColumnReorder?: boolean
  /** Shows a custom loading overlay on top of the body area of the datagrid */
  loadingOverlay?: N
  /** Pass custom classes into the datagrid element */
  className?: string
  /** Pass custom inline styles into the data element */
  style?: React.CSSProperties
}

export function DataGrid<T, S = unknown>({
  columns,
  onColumnsChange,
  onFiltersChange = noop,
  headerRowHeight,
  filterRowHeight,
  getRowId,
  getRowMeta = DEFAULT_GET_ROW_META,
  getRowDetailsMeta = DEFAULT_GET_ROW_DETAILS_META,
  data,
  pinnedTopData = emptyData,
  pinnedBottomData = emptyData,
  rowState = emptyRowState,
  setRowState,
  renderRowDetails = defaultRowDetailsRenderer,
  theme = darkTheme,
  multiSort,
  enableCellSelection,
  enableColumnResize,
  enableColumnReorder,
  loadingOverlay,
  className,
  style,
}: DataGridProps<T, S>) {
  const gridEl = useRef<HTMLDivElement>(null)
  const scrollEl = useRef<HTMLDivElement>(null)
  const viewportEl = useRef<HTMLDivElement>(null)

  // We can't trust that the user will memoize these.
  const renderRowDetailsRef = useRef(renderRowDetails)
  renderRowDetailsRef.current = renderRowDetails
  const onFiltersChangeRef = useRef(onFiltersChange)
  onFiltersChangeRef.current = onFiltersChange

  const [derivedCols, setDerivedCols] = useState<DerivedColsResult<T, N>>(
    EMPTY_DERIVED_COLS_RESULT
  )
  const [bodyAreas, setBodyAreas] = useState<BodyAreaDesc<T, N>[]>([])
  const [headerAreas, setHeaderAreas] = useState<HeaderAreaDesc<T, N>[]>([])
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [startCell, setStartCell] = useState<CellPosition>()
  const [selection, setSelection] = useState<CellSelection>()
  const [colResizeData, setColResizeData] = useState<ColResizeData>()
  const [colReorderKey, setColReorderKey] = useState<ItemId>()

  // Grid manager instance and props that don't change
  const [mgr] = useState(() =>
    createGridManager<T, N>({
      getRowId,
      getRowMeta,
      getRowDetailsMeta,
      renderRowDetails,
      setStartCell,
      setSelection,
      setColResizeData,
      setColReorderKey,
      onColumnsChange,
      onDerivedColumnsChange: setDerivedCols,
      onAreasChanged: setBodyAreas,
      onHeadersChanged: setHeaderAreas,
      onViewportChanged: setViewport,
      onContentHeightChanged: setContentHeight,
      onHeaderHeightChanged: setHeaderHeight,
    })
  )

  // Pass props which update to grid manager
  useEffect(() => {
    mgr.update({
      columns,
      headerRowHeight,
      filterRowHeight,
      data,
      pinnedTopData,
      pinnedBottomData,
      rowState,
      multiSort,
      enableCellSelection,
      enableColumnResize,
      enableColumnReorder,
    })
  }, [
    mgr,
    columns,
    headerRowHeight,
    filterRowHeight,
    data,
    pinnedTopData,
    pinnedBottomData,
    rowState,
    multiSort,
    enableCellSelection,
    enableColumnResize,
    enableColumnReorder,
  ])

  // Mount and unmount
  useEffect(
    () => mgr.mount(gridEl.current!, scrollEl.current!, viewportEl.current!),
    [mgr]
  )

  // Relay scroll events to actually move the view and move it based on React state changes
  // This makes flickers of blankness less likely
  useEffect(() => {
    viewportEl.current!.scrollTo(scrollLeft, scrollTop)
  }, [scrollTop, scrollLeft])

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const el = e.currentTarget
      if (el instanceof HTMLElement) {
        setScrollLeft(el.scrollLeft)
        setScrollTop(el.scrollTop)
        mgr.updateScroll(el.scrollLeft, el.scrollTop)
      }
    },
    [mgr]
  )

  const themeObj = useMemo(() => themeToCSSObj(theme), [theme])
  const mergedStyle = useMemo(
    () =>
      ({
        ...themeObj,
        minHeight: headerHeight,
        ...style,
      }) as CSSProperties,
    [themeObj, headerHeight, style]
  )

  return (
    <div
      ref={gridEl}
      className={cls('lg', className)}
      role="table"
      tabIndex={0}
      style={mergedStyle}
    >
      <div ref={scrollEl} className="lg-canvas lg-scroll" onScroll={onScroll}>
        <div
          className="lg-grid-sizer"
          style={{ width: derivedCols.size, height: contentHeight }}
        />
        <div
          ref={viewportEl}
          className="lg-viewport"
          data-cell-selection={enableCellSelection}
          style={{ width: viewport.width, height: viewport.height }}
        >
          <div
            className="lg-view"
            style={{ width: derivedCols.size, height: contentHeight }}
          >
            {bodyAreas.map(area => (
              <GridArea
                key={area.id}
                mgr={mgr}
                area={area}
                columns={area.colResult.items}
                rows={area.rowResult.items}
                rowState={rowState}
                setRowState={setRowState}
                detailsWidth={viewport.width}
                renderRowDetailsRef={renderRowDetailsRef}
                enableColumnReorder={enableColumnReorder}
                selection={selection}
                selectionStartCell={startCell}
                isFirstColumnGroup={area.colResult.firstWithSize}
                colReorderKey={colReorderKey}
              />
            ))}
            {headerAreas.map(headerArea => (
              <HeaderArea<T>
                key={headerArea.colAreaPos}
                mgr={mgr}
                columns={headerArea.columns}
                flatColumns={headerArea.flatColumns}
                colAreaPos={headerArea.colAreaPos}
                headerRowCount={headerArea.headerRowCount}
                headerRowHeight={headerArea.headerRowHeight}
                filterRowHeight={headerArea.filterRowHeight}
                onFiltersChangeRef={onFiltersChangeRef}
                left={headerArea.left}
                width={headerArea.width}
                height={headerArea.height}
                enableColumnResize={enableColumnResize}
                enableColumnReorder={enableColumnReorder}
                colReorderKey={colReorderKey}
              />
            ))}
          </div>
          {!!(enableColumnResize && colResizeData) && (
            <div
              className="lg-resizer-marker"
              style={{ left: colResizeData.left }}
            />
          )}
          {loadingOverlay && (
            <div
              className="lg-loading-overlay"
              style={{
                top: headerHeight,
                height: viewport.height - headerHeight,
              }}
            >
              {loadingOverlay}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
