'use client'
import { useEffect, useRef, useState, type CSSProperties, useCallback } from 'react'
import {
  defaultGetRowDetailsMeta,
  defaultGetRowMeta,
  defaultHeaderRowHeight,
  GetRowDetailsMeta,
  GetRowId,
  GetRowMeta,
  GroupedColumns,
  OnRowStateChange,
  RenderRowDetails,
  RowState,
  createGridManager,
  emptyDerivedColsResult,
  DerivedColsResult,
  GridArea,
  DerivedColumn,
  DerivedRow,
  CellSelection,
  CellPosition,
  CellSelectionPlugin,
} from '@lightfin/datagrid'
import '@lightfin/datagrid/dist/styles.css'
import { R } from './types'
import { HeaderArea } from './HeaderArea'
import { Area } from './Area'

const emptyData: any[] = []
const emptyRpwState: RowState = {}
const noop = () => {
  /**/
}
const defaultRowDetailsRenderer = () => (
  <div>Define a `renderRowDetails` to customize this</div>
)

interface DataGridProps<T> {
  columns: GroupedColumns<T, React.ReactNode>
  headerRowHeight?: number
  getRowId: GetRowId<T>
  getRowMeta?: GetRowMeta<T>
  getRowDetailsMeta?: GetRowDetailsMeta<T>
  data: T[]
  pinnedTopData?: T[]
  pinnedBottomData?: T[]
  rowState?: RowState
  renderRowDetails?: RenderRowDetails<T, React.ReactNode>
  onRowStateChange?: OnRowStateChange
  direction?: 'ltr' | 'rtl'
  theme?: string
  disableCellSelection?: boolean
}

export function DataGrid<T>({
  columns,
  headerRowHeight = defaultHeaderRowHeight,
  getRowId,
  getRowMeta = defaultGetRowMeta,
  getRowDetailsMeta = defaultGetRowDetailsMeta,
  data,
  pinnedTopData = emptyData,
  pinnedBottomData = emptyData,
  rowState = emptyRpwState,
  renderRowDetails = defaultRowDetailsRenderer,
  onRowStateChange = noop,
  direction,
  theme = 'lightfin-dark',
  disableCellSelection,
}: DataGridProps<T>) {
  const gridEl = useRef<HTMLDivElement>(null)
  const viewportEl = useRef<HTMLDivElement>(null)

  // We can't trust that the user will memoize these so we
  // assume they never change.
  const renderRowDetailsRef = useRef(renderRowDetails)
  renderRowDetailsRef.current = renderRowDetails
  const onRowStateChangeRef = useRef(onRowStateChange)
  onRowStateChangeRef.current = onRowStateChange

  const [derivedCols, setDerivedCols] =
    useState<DerivedColsResult<T, R>>(emptyDerivedColsResult)
  const [gridAreas, setGridAreas] = useState<GridArea<T, R>[]>([])
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [middleCols, setMiddleCols] = useState<DerivedColumn<T, R>[]>([])
  const [middleRows, setMiddleRows] = useState<DerivedRow<T>[]>([])
  const [startCell, setStartCell] = useState<CellPosition>()
  const [selection, setSelection] = useState<CellSelection>()

  // Grid manager instance and props that don't change
  const [mgr] = useState(() =>
    createGridManager<T, R>({
      getRowId,
      getRowMeta,
      getRowDetailsMeta,
      renderRowDetails,
      onRowStateChange,
      onColumnsChanged: setDerivedCols,
      onAreasChanged: setGridAreas,
      onViewportChanged: setViewport,
      onContentHeightChanged: setContentHeight,
      onHeaderHeightChanged: setHeaderHeight,
      onMiddleColsChange: setMiddleCols,
      onMiddleRowsChange: setMiddleRows,
    })
  )

  // Cell selection plugin
  useEffect(() => {
    if (!disableCellSelection) {
      mgr.addPlugin(
        'cellSelection',
        new CellSelectionPlugin(mgr, setStartCell, setSelection)
      )
      return () => mgr.removePlugin('cellSelection')
    }
  }, [mgr, disableCellSelection])

  // Pass props which update to grid manager
  useEffect(() => {
    mgr.update({
      columns,
      headerRowHeight,
      data,
      pinnedTopData,
      pinnedBottomData,
      rowState,
    })
  }, [mgr, columns, headerRowHeight, data, pinnedTopData, pinnedBottomData, rowState])

  // Mount and unmount
  useEffect(() => {
    mgr.mount(gridEl.current!)
    return () => mgr.unmount()
  }, [mgr])

  // Only change scroll when we receive an event, as the browser throttles
  // scroll events causing flashes of blankness on fast scrolling.
  // Also we don't do this in GridManager as this syncs up with React
  // rendering better and doesn't so easily cause flashes of blankness.
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

  const viewportWidth = viewport.width
  const viewportHeight = viewport.height

  return (
    <div
      ref={gridEl}
      className="lfg lfg-scroll"
      data-theme={theme}
      tabIndex={0}
      onScroll={onScroll}
      style={
        {
          '--lfg-direction': direction,
          minHeight: mgr.$headerHeight(),
        } as CSSProperties
      }
    >
      <div
        className="lfg-grid-sizer"
        style={{ width: derivedCols.size, height: contentHeight }}
      />
      <div
        ref={viewportEl}
        className="lfg-viewport"
        style={{ width: viewportWidth, height: viewportHeight }}
      >
        <div
          className="lfg-canvas"
          style={{ width: derivedCols.size, height: contentHeight }}
        >
          {gridAreas.map(area => (
            <Area
              key={area.id}
              area={area}
              columns={area.pinnedX ? area.colResult.items : middleCols}
              rows={area.pinnedY ? area.rowResult.items : middleRows}
              rowState={rowState}
              onRowStateChangeRef={onRowStateChangeRef}
              detailsWidth={viewportWidth}
              renderRowDetailsRef={renderRowDetailsRef}
              selection={selection}
              selectionStartCell={startCell}
              isFirstColumnGroup={area.colResult.firstWithSize}
            />
          ))}
          <HeaderArea
            /*header middle*/
            columns={middleCols}
            headerRowHeight={headerRowHeight}
            left={derivedCols.start.size}
            width={derivedCols.middle.size + derivedCols.end.size}
            height={headerHeight}
          />
          <HeaderArea
            /*header end (right)*/
            columns={derivedCols.end.itemsWithGrouping}
            headerRowHeight={headerRowHeight}
            left={viewport.width - derivedCols.end.size}
            width={derivedCols.end.size}
            height={headerHeight}
          />
          <HeaderArea
            /*header start (left)*/
            columns={derivedCols.start.itemsWithGrouping}
            headerRowHeight={headerRowHeight}
            left={0}
            width={derivedCols.start.size}
            height={headerHeight}
          />
        </div>
      </div>
    </div>
  )
}
