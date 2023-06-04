'use client'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
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
} from '@lightfin/datagrid'
import '@lightfin/datagrid/dist/styles.css'
import { R } from './types'
import { HeaderArea } from './HeaderArea'
import { Area } from './Area'

const EMPTY_DATA: any[] = []
const EMPTY_ROW_STATE: RowState = {}
const NOOP = () => {
  /**/
}
const DEFAULT_ROW_DETAILS_RENDERER = () => (
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
}

export function DataGrid<T>({
  columns,
  headerRowHeight = defaultHeaderRowHeight,
  getRowId,
  getRowMeta = defaultGetRowMeta,
  getRowDetailsMeta = defaultGetRowDetailsMeta,
  data,
  pinnedTopData = EMPTY_DATA,
  pinnedBottomData = EMPTY_DATA,
  rowState = EMPTY_ROW_STATE,
  renderRowDetails = DEFAULT_ROW_DETAILS_RENDERER,
  onRowStateChange = NOOP,
  direction,
  theme = 'lightfin-dark',
}: DataGridProps<T>) {
  const gridEl = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const gridViewRef = useRef<HTMLDivElement>(null)

  // We can't trust that the user will memoize these so we
  // assume they never change.
  const getRowIdRef = useRef(getRowId)
  getRowIdRef.current = getRowId
  const getRowMetaRef = useRef(getRowMeta)
  getRowMetaRef.current = getRowMeta
  const getRowDetailsMetaRef = useRef(getRowDetailsMeta)
  getRowDetailsMetaRef.current = getRowDetailsMeta
  const renderRowDetailsRef = useRef(renderRowDetails)
  renderRowDetailsRef.current = renderRowDetails
  const onRowStateChangeRef = useRef(onRowStateChange)
  onRowStateChangeRef.current = onRowStateChange

  const [derivedCols, setDerivedCols] =
    useState<DerivedColsResult<T, R>>(emptyDerivedColsResult)
  const [gridAreas, setGridAreas] = useState<GridArea<T, R>[]>([])
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [contentHeight, setContentHeight] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [middleCols, setMiddleCols] = useState<DerivedColumn<T, R>[]>([])
  const [middleRows, setMiddleRows] = useState<DerivedRow<T>[]>([])
  const [scrollbarSize, setScrollbarSize] = useState({ width: 0, height: 0 })
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)

  // TODO
  const selection: CellSelection | undefined = undefined
  const startCell: CellPosition | undefined = undefined

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
      onScrollbarSizeChange: setScrollbarSize,
    })
  )

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

  // Only change scroll when we receive an event, as the browser throttles
  // scroll events causing flashes of blankness on fast scrolling.
  useEffect(() => {
    gridViewRef.current!.scrollTo(scrollLeft, scrollTop)
  }, [scrollTop, scrollLeft])

  useEffect(() => {
    if (gridEl.current) {
      const onResize: ResizeObserverCallback = ([{ contentRect }]) => {
        mgr.updateViewport(contentRect.width, contentRect.height)
      }
      const observer = new ResizeObserver(onResize)
      observer.observe(gridEl.current)
      return () => observer.disconnect()
    }
  }, [mgr])

  const viewportWidth = viewport.width - scrollbarSize.width
  const viewportHeight = viewport.height - scrollbarSize.height

  return (
    <div
      ref={gridEl}
      className="lfg"
      data-theme={theme}
      tabIndex={0}
      onKeyDown={e => {
        const ne = e.nativeEvent
        mgr.onKeyDown(ne.key, ne.metaKey, ne.shiftKey)
      }}
      style={
        {
          '--lfg-direction': direction,
          minHeight: mgr.$headerHeight(),
        } as CSSProperties
      }
    >
      <div
        ref={scrollRef}
        className="lfg-canvas lfg-scroll"
        onScroll={e => {
          const el = e.currentTarget
          if (el instanceof HTMLElement) {
            setScrollLeft(el.scrollLeft)
            setScrollTop(el.scrollTop)
            mgr.updateScroll(el.scrollLeft, el.scrollTop)
          }
        }}
      >
        <div
          className="lfg-canvas-size"
          style={{ width: derivedCols.size, height: contentHeight }}
        />
        <div
          ref={gridViewRef}
          className="lfg-view-container"
          style={{ width: viewportWidth, height: viewportHeight }}
        >
          <div
            className="lfg-view"
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
              left={viewport.width - derivedCols.end.size - scrollbarSize.width}
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
    </div>
  )
}
