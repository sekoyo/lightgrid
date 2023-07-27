'use client'
import { useEffect, useRef, useState, type CSSProperties, useCallback } from 'react'
import {
  createGridManager,
  defaultGetRowDetailsMeta,
  defaultGetRowMeta,
  defaultHeaderRowHeight,
  emptyDerivedColsResult,
  CellSelection,
  CellPosition,
  ColResizeData,
  DerivedColsResult,
  DerivedColumn,
  DerivedRow,
  GetRowDetailsMeta,
  GetRowId,
  GetRowMeta,
  BodyAreaDesc,
  GroupedColumns,
  OnRowStateChange,
  RenderRowDetails,
  RowState,
  HeaderAreaDesc,
  ItemId,
} from '@lightfin/datagrid'
import '@lightfin/datagrid/dist/styles.css'
import { R } from './types'
import { HeaderArea } from './HeaderArea'
import { GridArea } from './GridArea'

const emptyData: any[] = []
const emptyRowState: RowState = {}
const noop = () => {
  /**/
}
const defaultRowDetailsRenderer = () => (
  <div>Define a `renderRowDetails` to customize this</div>
)

interface DataGridProps<T> {
  columns: GroupedColumns<T, React.ReactNode>
  onColumnsChange?: (columnns: GroupedColumns<T, React.ReactNode>) => void
  headerRowHeight?: number
  getRowId: GetRowId<T>
  getRowMeta?: GetRowMeta<T>
  getRowDetailsMeta?: GetRowDetailsMeta<T>
  data: T[]
  onDataChange?: (data: T[]) => void
  pinnedTopData?: T[]
  pinnedBottomData?: T[]
  rowState?: RowState
  renderRowDetails?: RenderRowDetails<T, React.ReactNode>
  onRowStateChange?: OnRowStateChange
  direction?: 'ltr' | 'rtl'
  theme?: string
  enableCellSelection?: boolean
  enableColumnResize?: boolean
  enableColumnReorder?: boolean
  enableColumnSort?: boolean
}

export function DataGrid<T>({
  columns,
  onColumnsChange,
  headerRowHeight = defaultHeaderRowHeight,
  getRowId,
  getRowMeta = defaultGetRowMeta,
  getRowDetailsMeta = defaultGetRowDetailsMeta,
  data,
  onDataChange,
  pinnedTopData = emptyData,
  pinnedBottomData = emptyData,
  rowState = emptyRowState,
  renderRowDetails = defaultRowDetailsRenderer,
  onRowStateChange = noop,
  direction,
  theme = 'lightfin-dark',
  enableCellSelection,
  enableColumnResize,
  enableColumnReorder,
  enableColumnSort,
}: DataGridProps<T>) {
  const gridEl = useRef<HTMLDivElement>(null)
  const scrollEl = useRef<HTMLDivElement>(null)
  const viewportEl = useRef<HTMLDivElement>(null)

  // We can't trust that the user will memoize these so we
  // assume they never change.
  const renderRowDetailsRef = useRef(renderRowDetails)
  renderRowDetailsRef.current = renderRowDetails
  const onRowStateChangeRef = useRef(onRowStateChange)
  onRowStateChangeRef.current = onRowStateChange

  const [derivedCols, setDerivedCols] =
    useState<DerivedColsResult<T, R>>(emptyDerivedColsResult)
  const [gridAreas, setBodyAreas] = useState<BodyAreaDesc<T, R>[]>([])
  const [headerAreas, setHeaderAreas] = useState<HeaderAreaDesc<T, R>[]>([])
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [middleCols, setMiddleCols] = useState<DerivedColumn<T, R>[]>([])
  const [middleRows, setMiddleRows] = useState<DerivedRow<T>[]>([])
  const [startCell, setStartCell] = useState<CellPosition>()
  const [selection, setSelection] = useState<CellSelection>()
  const [colResizeData, setColResizeData] = useState<ColResizeData>()
  const [colReorderKey, setColReorderKey] = useState<ItemId>()

  // Grid manager instance and props that don't change
  const [mgr] = useState(() =>
    createGridManager<T, R>({
      getRowId,
      getRowMeta,
      getRowDetailsMeta,
      renderRowDetails,
      setStartCell,
      setSelection,
      setColResizeData,
      setColReorderKey,
      onRowStateChange,
      onColumnsChange,
      onDataChange,
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
      data,
      pinnedTopData,
      pinnedBottomData,
      rowState,
      enableCellSelection,
      enableColumnResize,
      enableColumnReorder,
      enableColumnSort,
    })
  }, [
    mgr,
    columns,
    headerRowHeight,
    data,
    pinnedTopData,
    pinnedBottomData,
    rowState,
    enableCellSelection,
    enableColumnResize,
    enableColumnReorder,
    enableColumnSort,
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

  return (
    <div
      ref={gridEl}
      className="lfg"
      role="table"
      data-theme={theme}
      tabIndex={0}
      style={
        {
          '--lfg-direction': direction,
          minHeight: headerHeight,
        } as CSSProperties
      }
    >
      <div ref={scrollEl} className="lfg-canvas lfg-scroll" onScroll={onScroll}>
        <div
          className="lfg-grid-sizer"
          style={{ width: derivedCols.size, height: contentHeight }}
        />
        <div
          ref={viewportEl}
          className="lfg-viewport"
          style={{ width: viewport.width, height: viewport.height }}
        >
          <div
            className="lfg-view"
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
                onRowStateChangeRef={onRowStateChangeRef}
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
              <HeaderArea
                key={headerArea.colAreaPos}
                mgr={mgr}
                columns={headerArea.columns}
                colAreaPos={headerArea.colAreaPos}
                headerRowHeight={headerArea.headerRowHeight}
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
              className="lfg-column-resize-marker"
              style={{ left: colResizeData.left }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
