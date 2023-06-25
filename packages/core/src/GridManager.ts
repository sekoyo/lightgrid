import { root, signal, computed, effect } from '@maverick-js/signals'
import throttle from 'lodash-es/throttle'

import {
  AreaPos,
  DerivedColsResult,
  DerivedColumn,
  DerivedRow,
  DerivedRowsResult,
  GetRowDetailsMeta,
  GetRowId,
  GetRowMeta,
  GridAreaDesc,
  GroupedColumns,
  OnRowStateChange,
  RenderRowDetails,
  RowState,
} from './types'
import {
  deriveColumns,
  deriveRows,
  getColumnWindow,
  getRowWindow,
  getScrollBarSize,
  willScrollbarsAppear,
} from './utils'
import { GridPlugin } from './GridPlugin'

type Viewport = { width: number; height: number }

interface GridManagerStaticProps<T, R> {
  getRowId: GetRowId<T>
  getRowMeta: GetRowMeta<T>
  getRowDetailsMeta: GetRowDetailsMeta<T>
  renderRowDetails: RenderRowDetails<T, R>
  onRowStateChange: OnRowStateChange
  onColumnsChanged: (derivedCols: DerivedColsResult<T, R>) => void
  onAreasChanged: (gridAreas: GridAreaDesc<T, R>[]) => void
  onViewportChanged: ({ width, height }: Viewport) => void
  onContentHeightChanged: (value: number) => void
  onHeaderHeightChanged: (value: number) => void
  onMiddleColsChange: (cols: DerivedColumn<T, R>[]) => void
  onMiddleRowsChange: (rows: DerivedRow<T>[]) => void
}

interface GridManagerDynamicProps<T, R> {
  columns: GroupedColumns<T, R>
  headerRowHeight: number
  data: T[]
  pinnedTopData: T[]
  pinnedBottomData: T[]
  rowState: RowState
}

export class GridManager<T, R> {
  gridEl?: HTMLDivElement
  scrollEl?: HTMLDivElement
  viewportEl?: HTMLDivElement
  sizeObserver?: ResizeObserver
  scrollbarSize = getScrollBarSize()
  mounted = false

  // Static props
  getRowId: GetRowId<T>
  getRowMeta: GetRowMeta<T>
  getRowDetailsMeta: GetRowDetailsMeta<T>
  renderRowDetails: RenderRowDetails<T, R>
  onRowStateChange: OnRowStateChange

  // Dynamic props
  $plugins = signal<Record<string, GridPlugin<T, R>>>({})
  $viewportWidth = signal(0)
  $viewportHeight = signal(0)
  $columns = signal<GroupedColumns<T, R>>([])
  $headerRowHeight = signal(0)
  $data = signal<T[]>([])
  $pinnedTopData = signal<T[]>([])
  $pinnedBottomData = signal<T[]>([])
  $rowState = signal<RowState>({})

  // Derived values
  $derivedCols = computed(() => deriveColumns(this.$columns(), this.$viewportWidth()))
  $headerHeight = computed(() => this.$derivedCols().headerRows * this.$headerRowHeight())
  $derivedStartRows = computed(() =>
    deriveRows(
      AreaPos.Start,
      this.$pinnedTopData(),
      this.$rowState(),
      this.getRowId,
      this.getRowMeta,
      this.getRowDetailsMeta,
      () => this.$headerHeight(),
      0
    )
  )
  $derivedMiddleRows = computed(() =>
    deriveRows(
      AreaPos.Middle,
      this.$data(),
      this.$rowState(),
      this.getRowId,
      this.getRowMeta,
      this.getRowDetailsMeta,
      () => this.$headerHeight() + this.$derivedStartRows().size,
      this.$derivedStartRows().items.length
    )
  )
  $derivedEndRows = computed(() =>
    deriveRows(
      AreaPos.End,
      this.$pinnedBottomData(),
      this.$rowState(),
      this.getRowId,
      this.getRowMeta,
      this.getRowDetailsMeta,
      thisSize => this.$viewportHeight() - thisSize,
      this.$derivedStartRows().items.length + this.$derivedMiddleRows().items.length
    )
  )
  $derivedRows = computed<DerivedRowsResult<T>>(() => {
    const start = this.$derivedStartRows()
    const middle = this.$derivedMiddleRows()
    const end = this.$derivedEndRows()
    return {
      start,
      middle,
      end,
      size: start.size + middle.size + end.size,
      itemCount: start.items.length + middle.items.length + end.items.length,
    }
  })

  $bodyHeight = computed(
    () =>
      this.$derivedRows().middle.size +
      this.$derivedRows().start.size +
      this.$derivedRows().end.size
  )
  $contentHeight = computed(() => this.$headerHeight() + this.$bodyHeight())
  $hasScroll = computed(() =>
    willScrollbarsAppear(
      this.$viewportWidth(),
      this.$viewportHeight(),
      this.$derivedCols().size,
      this.$contentHeight(),
      this.scrollbarSize
    )
  )
  $scrollbarWidth = computed(() =>
    this.$hasScroll().hasHScroll ? this.scrollbarSize : 0
  )
  $scrollbarHeight = computed(() =>
    this.$hasScroll().hasVScroll ? this.scrollbarSize : 0
  )

  // -- Column window.
  $midWidth = computed(
    () =>
      this.$viewportWidth() -
      this.$derivedCols().start.size -
      this.$derivedCols().end.size
  )
  $colWindow = computed(() =>
    getColumnWindow(this.$midWidth(), this.$scrollX(), this.$derivedCols().middle.items)
  )
  $middleCols = computed(() =>
    this.$derivedCols().middle.items.slice(this.$colWindow()[0], this.$colWindow()[1] + 1)
  )

  // -- Row window.
  $midHeight = computed(
    () =>
      this.$viewportHeight() -
      this.$headerHeight() -
      this.$derivedRows().start.size -
      this.$derivedRows().end.size
  )
  $rowWindow = computed(() =>
    getRowWindow(this.$midHeight(), this.$scrollY(), this.$derivedRows().middle.items)
  )
  $middleRows = computed(() =>
    this.$derivedRows().middle.items.slice(this.$rowWindow()[0], this.$rowWindow()[1] + 1)
  )

  // -- Grid areas (pushed in render order)
  $areas = computed(() => {
    const byRender: GridAreaDesc<T, R>[] = []
    const byCol: GridAreaDesc<T, R>[][] = []

    const addToCol = (colIndex: number, rowIndex: number, area: GridAreaDesc<T, R>) => {
      if (!byCol[colIndex]) {
        byCol[colIndex] = []
      }
      byCol[colIndex][rowIndex] = area
    }

    const derivedRows = this.$derivedRows()
    const derivedCols = this.$derivedCols()
    const middleWidth =
      this.$viewportWidth() - derivedCols.start.size - derivedCols.end.size
    const middleHeight =
      this.$viewportHeight() - derivedRows.middle.startOffset - derivedRows.end.size
    const endX = this.$viewportWidth() - derivedCols.end.size - this.$scrollbarWidth()
    const endY = this.$viewportHeight() - derivedRows.end.size - this.$scrollbarHeight()

    // Main
    if (derivedRows.middle.size) {
      if (derivedCols.middle.size) {
        const area: GridAreaDesc<T, R> = {
          id: 'mainMiddle',
          windowX: derivedCols.middle.startOffset,
          windowY: derivedRows.middle.startOffset,
          windowWidth: middleWidth,
          windowHeight: middleHeight,
          width: derivedCols.middle.size,
          height: derivedRows.middle.size,
          colResult: derivedCols.middle,
          rowResult: derivedRows.middle,
          pinnedX: false,
          pinnedY: false,
        }
        byRender.push(area)
        addToCol(AreaPos.Middle, AreaPos.Middle, area)
      }
      if (derivedCols.end.size) {
        const area: GridAreaDesc<T, R> = {
          id: 'mainRight',
          windowX: endX,
          windowY: derivedRows.middle.startOffset,
          windowWidth: derivedCols.end.size,
          windowHeight: middleHeight,
          width: derivedCols.end.size,
          height: derivedRows.middle.size,
          colResult: derivedCols.end,
          rowResult: derivedRows.middle,
          pinnedX: true,
          pinnedY: false,
        }
        byRender.push(area)
        addToCol(AreaPos.End, AreaPos.Middle, area)
      }
      if (derivedCols.start.size) {
        const area: GridAreaDesc<T, R> = {
          id: 'mainLeft',
          windowX: 0,
          windowY: derivedRows.middle.startOffset,
          windowWidth: derivedCols.start.size,
          windowHeight: middleHeight,
          width: derivedCols.start.size,
          height: derivedRows.middle.size,
          colResult: derivedCols.start,
          rowResult: derivedRows.middle,
          pinnedX: true,
          pinnedY: false,
        }
        byRender.push(area)
        addToCol(AreaPos.Start, AreaPos.Middle, area)
      }
    }

    // Top
    if (derivedRows.start.size) {
      if (derivedCols.middle.size) {
        const area: GridAreaDesc<T, R> = {
          id: 'topMiddle',
          windowX: derivedCols.middle.startOffset,
          windowY: derivedRows.start.startOffset,
          windowWidth: middleWidth,
          windowHeight: derivedRows.start.size,
          width: derivedCols.middle.size + derivedCols.end.size,
          height: derivedRows.start.size,
          colResult: derivedCols.middle,
          rowResult: derivedRows.start,
          pinnedX: false,
          pinnedY: true,
        }
        byRender.push(area)
        addToCol(AreaPos.Middle, AreaPos.Start, area)
      }
      if (derivedCols.end.size) {
        const area: GridAreaDesc<T, R> = {
          id: 'topRight',
          windowX: endX,
          windowY: derivedRows.start.startOffset,
          windowWidth: derivedCols.end.size,
          windowHeight: derivedRows.start.size,
          width: derivedCols.end.size,
          height: derivedRows.start.size,
          colResult: derivedCols.end,
          rowResult: derivedRows.start,
          pinnedX: true,
          pinnedY: true,
        }
        byRender.push(area)
        addToCol(AreaPos.End, AreaPos.Start, area)
      }
      if (derivedCols.start.size) {
        const area: GridAreaDesc<T, R> = {
          id: 'topLeft',
          windowX: 0,
          windowY: derivedRows.start.startOffset,
          windowWidth: derivedCols.start.size,
          windowHeight: derivedRows.start.size,
          width: derivedCols.start.size,
          height: derivedRows.start.size,
          colResult: derivedCols.start,
          rowResult: derivedRows.start,
          pinnedX: true,
          pinnedY: true,
        }
        byRender.push(area)
        addToCol(AreaPos.Start, AreaPos.Start, area)
      }
    }

    // Bottom
    if (derivedRows.end.size) {
      if (derivedCols.middle.size) {
        const area: GridAreaDesc<T, R> = {
          id: 'bottomMiddle',
          windowX: derivedCols.middle.startOffset,
          windowY: endY,
          windowWidth: middleWidth,
          width: derivedCols.middle.size + derivedCols.end.size,
          height: derivedRows.end.size,
          windowHeight: derivedRows.end.size,
          colResult: derivedCols.middle,
          rowResult: derivedRows.end,
          pinnedX: false,
          pinnedY: true,
        }
        byRender.push(area)
        addToCol(AreaPos.Middle, AreaPos.End, area)
      }
      if (derivedCols.end.size) {
        const area: GridAreaDesc<T, R> = {
          id: 'bottomRight',
          windowX: endX,
          windowY: endY,
          windowWidth: derivedCols.end.size,
          windowHeight: derivedRows.end.size,
          width: derivedCols.end.size,
          height: derivedRows.end.size,
          colResult: derivedCols.end,
          rowResult: derivedRows.end,
          pinnedX: true,
          pinnedY: true,
        }
        byRender.push(area)
        addToCol(AreaPos.End, AreaPos.End, area)
      }
      if (derivedCols.start.size) {
        const area: GridAreaDesc<T, R> = {
          id: 'bottomLeft',
          windowX: 0,
          windowY: endY,
          windowWidth: derivedCols.start.size,
          windowHeight: derivedRows.end.size,
          width: derivedCols.start.size,
          height: derivedRows.end.size,
          colResult: derivedCols.start,
          rowResult: derivedRows.end,
          pinnedX: true,
          pinnedY: true,
        }
        byRender.push(area)
        addToCol(AreaPos.Start, AreaPos.End, area)
      }
    }

    return { byCol, byRender }
  })

  // State
  $scrollY = signal(0)
  $scrollX = signal(0)

  constructor(props: GridManagerStaticProps<T, R>) {
    this.getRowId = props.getRowId
    this.getRowMeta = props.getRowMeta
    this.getRowDetailsMeta = props.getRowDetailsMeta
    this.renderRowDetails = props.renderRowDetails
    this.onRowStateChange = props.onRowStateChange

    effect(() => props.onColumnsChanged(this.$derivedCols()))
    effect(() => props.onAreasChanged(this.$areas().byRender))
    effect(() =>
      props.onViewportChanged({
        width: this.$viewportWidth() - this.$scrollbarWidth(),
        height: this.$viewportHeight() - this.$scrollbarHeight(),
      })
    )
    effect(() => props.onContentHeightChanged(this.$contentHeight()))
    effect(() => props.onHeaderHeightChanged(this.$headerHeight()))
    effect(() => props.onMiddleColsChange(this.$middleCols()))
    effect(() => props.onMiddleRowsChange(this.$middleRows()))
  }

  mount(gridEl: HTMLDivElement, scrollEl: HTMLDivElement, viewportEl: HTMLDivElement) {
    this.mounted = true
    this.gridEl = gridEl
    this.scrollEl = scrollEl
    this.viewportEl = viewportEl
    this.sizeObserver = new ResizeObserver(this.onResize)
    this.sizeObserver.observe(gridEl)

    Object.values(this.$plugins()).forEach(plugin => {
      if (plugin?.mount) {
        plugin.mount()
      }
    })
  }

  unmount() {
    this.mounted = false
    this.sizeObserver?.disconnect()
    this.onResize.cancel()
    Object.values(this.$plugins()).forEach(plugin => {
      if (plugin?.unmount) {
        plugin.unmount()
      }
    })
  }

  update(props: GridManagerDynamicProps<T, R>) {
    this.$columns.set(props.columns)
    this.$headerRowHeight.set(props.headerRowHeight)
    this.$data.set(props.data)
    this.$pinnedTopData.set(props.pinnedTopData)
    this.$pinnedBottomData.set(props.pinnedBottomData)
    this.$rowState.set(props.rowState)
  }

  updateScroll(scrollLeft: number, scrollTop: number) {
    this.$scrollX.set(scrollLeft)
    this.$scrollY.set(scrollTop)
  }

  // When scrolling we should scroll both scrollEl and viewportEl.
  // Preferably we'd have an effect on $scrollX/Y but we don't want
  // the set in `updateScroll` to scroll (the UI framework should do that)
  // but `untrack` from @maverick-js/signals isn't working as expected:
  // https://github.com/maverick-js/signals/issues/22
  scrollLeft(value: number) {
    this.scrollEl!.scrollLeft = value
    this.viewportEl!.scrollLeft = value
  }
  scrollTop(value: number) {
    this.scrollEl!.scrollTop = value
    this.viewportEl!.scrollTop = value
  }
  scrollTo(x: number, y: number) {
    this.scrollEl!.scrollTo(x, y)
    this.viewportEl!.scrollTo(x, y)
  }

  private onResize = throttle<ResizeObserverCallback>(([{ contentRect }]) => {
    this.$viewportWidth.set(contentRect.width)
    this.$viewportHeight.set(contentRect.height)
  }, 30)

  addPlugin(id: string, plugin: GridPlugin<T, R>) {
    this.$plugins.set(prev => ({ ...prev, [id]: plugin }))
    if (this.mounted && plugin.mount) {
      plugin.mount()
    }
  }

  removePlugin(id: string) {
    this.$plugins.set(prev => {
      if (prev[id]) {
        const plugin = prev[id]
        if (plugin.unmount) {
          plugin.unmount()
        }
        delete prev[id]
      }
      return { ...prev }
    })
  }
}

export function createGridManager<T, R>(props: GridManagerStaticProps<T, R>) {
  return root(() => new GridManager(props))
}
