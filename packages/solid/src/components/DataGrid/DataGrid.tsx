'use client'
import {
  createEffect,
  createSignal,
  createMemo,
  type JSX,
  For,
  mergeProps,
} from 'solid-js'
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
} from '@lightfin/datagrid'
import '@lightfin/datagrid/dist/styles.css'
import { N } from './types'
import { HeaderArea } from './HeaderArea'
import { GridArea } from './GridArea'
import { createStore } from 'solid-js/store'

const emptyData: any[] = []
const emptyRowState: RowState<any> = {}
const noop = () => {}
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
  class?: string
  style?: JSX.CSSProperties
}

export function DataGrid<T, S = unknown>(_props: DataGridProps<T, S>) {
  const props = mergeProps(
    {
      onFiltersChange: noop,
      getRowMeta: DEFAULT_GET_ROW_META,
      getRowDetailsMeta: DEFAULT_GET_ROW_DETAILS_META,
      pinnedTopData: emptyData,
      pinnedBottomData: emptyData,
      rowState: emptyRowState,
      renderRowDetails: defaultRowDetailsRenderer,
      theme: darkTheme,
    },
    _props
  )
  let gridEl: HTMLDivElement | undefined
  let scrollEl: HTMLDivElement | undefined
  let viewportEl: HTMLDivElement | undefined

  const [derivedCols, setDerivedCols] = createStore<DerivedColsResult<T, N>>(
    EMPTY_DERIVED_COLS_RESULT
  )
  const [bodyAreas, setBodyAreas] = createStore<BodyAreaDesc<T, N>[]>([])
  const [headerAreas, setHeaderAreas] = createStore<HeaderAreaDesc<T, N>[]>([])
  const [viewport, setViewport] = createSignal({ width: 0, height: 0 })
  const [scrollLeft, setScrollLeft] = createSignal(0)
  const [scrollTop, setScrollTop] = createSignal(0)
  const [contentHeight, setContentHeight] = createSignal(0)
  const [headerHeight, setHeaderHeight] = createSignal(0)
  const [startCell, setStartCell] = createSignal<CellPosition>()
  const [selection, setSelection] = createSignal<CellSelection>()
  const [colResizeData, setColResizeData] = createSignal<ColResizeData>()
  const [colReorderKey, setColReorderKey] = createSignal<ItemId>()

  // Grid manager instance and props that don't change
  const mgr = createGridManager<T, N>({
    getRowId: props.getRowId,
    getRowMeta: props.getRowMeta,
    getRowDetailsMeta: props.getRowDetailsMeta,
    renderRowDetails: props.renderRowDetails,
    setStartCell: setStartCell,
    setSelection: setSelection,
    setColResizeData: setColResizeData,
    setColReorderKey: setColReorderKey,
    onColumnsChange: props.onColumnsChange,
    onDerivedColumnsChange: setDerivedCols,
    onAreasChanged: setBodyAreas,
    onHeadersChanged: setHeaderAreas,
    onViewportChanged: setViewport,
    onContentHeightChanged: setContentHeight,
    onHeaderHeightChanged: setHeaderHeight,
  })

  // Pass props which update to grid manager
  createEffect(() => {
    mgr.update({
      columns: props.columns,
      headerRowHeight: props.headerRowHeight,
      filterRowHeight: props.filterRowHeight,
      data: props.data,
      pinnedTopData: props.pinnedTopData,
      pinnedBottomData: props.pinnedBottomData,
      rowState: props.rowState,
      multiSort: props.multiSort,
      enableCellSelection: props.enableCellSelection,
      enableColumnResize: props.enableColumnResize,
      enableColumnReorder: props.enableColumnReorder,
    })
  })

  // Mount and unmount
  createEffect(() => mgr.mount(gridEl!, scrollEl!, viewportEl!))

  // Relay scroll events to actual viewport, this coordinates events
  // with scroll, otherwise scrolling can move faster than reported events
  createEffect(() => {
    viewportEl!.scrollTo(scrollLeft(), scrollTop())
  })

  const onScroll: JSX.EventHandlerUnion<HTMLDivElement, Event> = e => {
    const el = e.currentTarget
    if (el instanceof HTMLElement) {
      setScrollLeft(el.scrollLeft)
      setScrollTop(el.scrollTop)
      mgr.updateScroll(el.scrollLeft, el.scrollTop)
    }
  }

  const themeObj = createMemo(() => themeToCSSObj(props.theme))
  const mergedStyle = createMemo(
    () =>
      ({
        ...themeObj(),
        '--lgDirection': props.direction,
        'min-height': `${headerHeight()}px`,
        ...props.style,
      }) as JSX.CSSProperties
  )

  return (
    <div
      ref={gridEl}
      class={cls('lg', props.class)}
      role="table"
      tabIndex={0}
      style={mergedStyle()}
    >
      <div ref={scrollEl} class="lg-canvas lg-scroll" onScroll={onScroll}>
        <div
          class="lg-grid-sizer"
          style={{ width: `${derivedCols.size}px`, height: `${contentHeight()}px` }}
        />
        <div
          ref={viewportEl}
          class="lg-viewport"
          style={{ width: `${viewport().width}px`, height: `${viewport().height}px` }}
        >
          <div
            class="lg-view"
            style={{ width: `${derivedCols.size}px`, height: `${contentHeight()}px` }}
          >
            <For each={bodyAreas}>
              {area => (
                <GridArea
                  mgr={mgr}
                  area={area}
                  columns={area.colResult.items}
                  rows={area.rowResult.items}
                  rowState={props.rowState}
                  setRowState={props.setRowState}
                  detailsWidth={viewport().width}
                  renderRowDetails={props.renderRowDetails}
                  enableColumnReorder={props.enableColumnReorder}
                  selection={selection()}
                  selectionStartCell={startCell()}
                  isFirstColumnGroup={area.colResult.firstWithSize}
                  colReorderKey={colReorderKey()}
                />
              )}
            </For>
            <For each={headerAreas}>
              {headerArea => (
                <HeaderArea<T>
                  mgr={mgr}
                  columns={headerArea.columns}
                  flatColumns={headerArea.flatColumns}
                  colAreaPos={headerArea.colAreaPos}
                  headerRowCount={headerArea.headerRowCount}
                  headerRowHeight={headerArea.headerRowHeight}
                  filterRowHeight={headerArea.filterRowHeight}
                  onFiltersChange={props.onFiltersChange}
                  left={headerArea.left}
                  width={headerArea.width}
                  height={headerArea.height}
                  enableColumnResize={props.enableColumnResize}
                  enableColumnReorder={props.enableColumnReorder}
                  colReorderKey={colReorderKey()}
                />
              )}
            </For>
          </div>
          {!!(props.enableColumnResize && colResizeData()) && (
            <div
              class="lg-resizer-marker"
              style={{ left: `${colResizeData()!.left}px` }}
            />
          )}
          {props.loadingOverlay && (
            <div
              class="lg-loading-overlay"
              style={{
                top: `${headerHeight()}px`,
                height: `${viewport().height - headerHeight()}px`,
              }}
            >
              {props.loadingOverlay}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
