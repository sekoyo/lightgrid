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
  DerivedColumn,
  DerivedRow,
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
} from '@lightfin/datagrid'
import '@lightfin/datagrid/dist/styles.css'
import { N } from './types'
import { HeaderArea } from './HeaderArea'
import { GridArea } from './GridArea'

const emptyData: any[] = []
const emptyRowState: RowState<any> = {}
const noop = () => {
  /**/
}
const defaultRowDetailsRenderer = () => (
  <div>Define a `renderRowDetails` to customize this</div>
)

// TODO: JSDoc these props
interface DataGridProps<T, S> {
  columns: GroupedColumns<T, N, S>
  onColumnsChange?: (columnns: GroupedColumns<T, N>) => void
  onFiltersChange?: OnFiltersChange<T, N>
  headerRowHeight?: number
  filterRowHeight?: number
  getRowId: GetRowId<T>
  getRowMeta?: GetRowMeta<T>
  getRowDetailsMeta?: GetRowDetailsMeta<T>
  data: T[]
  pinnedTopData?: T[]
  pinnedBottomData?: T[]
  rowState?: RowState<S>
  setRowState?: StateSetter<RowState<S>>
  renderRowDetails?: RenderRowDetails<T, N>
  direction?: 'ltr' | 'rtl'
  theme?: Theme
  multiSort?: boolean
  enableCellSelection?: boolean
  enableColumnResize?: boolean
  enableColumnReorder?: boolean
  loadingOverlay?: N
  className?: string
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
  direction,
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
  const [gridAreas, setBodyAreas] = useState<BodyAreaDesc<T, N>[]>([])
  const [headerAreas, setHeaderAreas] = useState<HeaderAreaDesc<T, N>[]>([])
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [middleCols, setMiddleCols] = useState<DerivedColumn<T, N>[]>([])
  const [middleRows, setMiddleRows] = useState<DerivedRow<T>[]>([])
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
      onMiddleColsChange: setMiddleCols,
      onMiddleRowsChange: setMiddleRows,
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
        '--lgDirection': direction,
        minHeight: headerHeight,
        ...style,
      }) as CSSProperties,
    [themeObj, direction, headerHeight, style]
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
          style={{ width: viewport.width, height: viewport.height }}
        >
          <div
            className="lg-view"
            style={{ width: derivedCols.size, height: contentHeight }}
          >
            {gridAreas.map(area => (
              <GridArea
                key={area.id}
                mgr={mgr}
                area={area}
                columns={area.pinnedX ? area.colResult.items : middleCols}
                rows={area.pinnedY ? area.rowResult.items : middleRows}
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
            <div className="lg-resizer-marker" style={{ left: colResizeData.left }} />
          )}
          {loadingOverlay && (
            <div
              className="lg-loading-overlay"
              style={{ top: headerHeight, height: viewport.height - headerHeight }}
            >
              {loadingOverlay}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
