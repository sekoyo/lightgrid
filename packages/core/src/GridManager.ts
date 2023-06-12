import { root, signal, computed, effect } from '@maverick-js/signals'
import {
  DerivedColsResult,
  DerivedColumn,
  DerivedRow,
  GetRowDetailsMeta,
  GetRowId,
  GetRowMeta,
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
  throttle,
  willScrollbarsAppear,
} from './utils'
import { AreaPin, GridArea } from './GridArea'
import { GridPlugin } from './GridPlugin'

enum AreaIndex {
  Start,
  Middle,
  End,
}

type Viewport = { width: number; height: number }

interface GridManagerStaticProps<T, R> {
  getRowId: GetRowId<T>
  getRowMeta: GetRowMeta<T>
  getRowDetailsMeta: GetRowDetailsMeta<T>
  renderRowDetails: RenderRowDetails<T, R>
  onRowStateChange: OnRowStateChange
  onColumnsChanged: (derivedCols: DerivedColsResult<T, R>) => void
  onAreasChanged: (gridAreas: GridArea<T, R>[]) => void
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
  $derivedRows = computed(() =>
    deriveRows(
      this.$pinnedTopData(),
      this.$data(),
      this.$pinnedBottomData(),
      this.$rowState(),
      this.$headerHeight(),
      this.getRowId,
      this.getRowMeta,
      this.getRowDetailsMeta
    )
  )
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
    this.$hasScroll().hasHScroll ? this.scrollbarSize : 0
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
  // TODO: include top, left, pinnedX, pinnedY?
  $areas = computed(() => {
    const byRender: GridArea<T, R>[] = []
    const byCol: GridArea<T, R>[][] = []

    const addToCol = (colIndex: number, rowIndex: number, area: GridArea<T, R>) => {
      if (!byCol[colIndex]) {
        byCol[colIndex] = []
      }
      byCol[colIndex][rowIndex] = area
    }

    // Main
    if (this.$derivedRows().middle.size) {
      if (this.$derivedCols().middle.size) {
        const area: GridArea<T, R> = new GridArea({
          id: 'mainMiddle',
          windowX: this.$derivedCols().middle.startOffset,
          windowY: this.$derivedRows().middle.startOffset,
          windowWidth:
            this.$viewportWidth() -
            this.$derivedCols().start.size -
            this.$derivedCols().end.size,
          windowHeight:
            this.$viewportHeight() -
            this.$derivedRows().start.startOffset -
            this.$derivedRows().end.size,
          width: this.$derivedCols().middle.size,
          height: this.$derivedRows().middle.size,
          colResult: this.$derivedCols().middle,
          rowResult: this.$derivedRows().middle,
          pinnedX: false,
          pinnedY: false,
        })
        byRender.push(area)
        addToCol(AreaIndex.Middle, AreaIndex.Middle, area)
      }
      if (this.$derivedCols().end.size) {
        const area: GridArea<T, R> = new GridArea({
          id: 'mainRight',
          pin: AreaPin.x,
          windowX: this.$viewportWidth() - this.$derivedCols().end.size,
          windowY: this.$derivedRows().middle.startOffset,
          windowWidth: this.$derivedCols().end.size,
          windowHeight:
            this.$viewportHeight() -
            this.$derivedRows().start.startOffset -
            this.$derivedRows().end.size,
          width: this.$derivedCols().end.size,
          height: this.$derivedRows().middle.size,
          colResult: this.$derivedCols().end,
          rowResult: this.$derivedRows().middle,
          pinnedX: true,
          pinnedY: false,
        })
        byRender.push(area)
        addToCol(AreaIndex.End, AreaIndex.Middle, area)
      }
      if (this.$derivedCols().start.size) {
        const area: GridArea<T, R> = new GridArea({
          id: 'mainLeft',
          pin: AreaPin.x,
          windowX: 0,
          windowY: this.$derivedRows().middle.startOffset,
          windowWidth: this.$derivedCols().start.size,
          windowHeight:
            this.$viewportHeight() -
            this.$derivedRows().start.startOffset -
            this.$derivedRows().end.size,
          width: this.$derivedCols().start.size,
          height: this.$derivedRows().middle.size,
          colResult: this.$derivedCols().start,
          rowResult: this.$derivedRows().middle,
          pinnedX: true,
          pinnedY: false,
        })
        byRender.push(area)
        addToCol(AreaIndex.Start, AreaIndex.Middle, area)
      }
    }

    // Top
    if (this.$derivedRows().start.size) {
      if (this.$derivedCols().middle.size) {
        const area: GridArea<T, R> = new GridArea({
          id: 'topMiddle',
          pin: AreaPin.y,
          windowX: this.$derivedCols().middle.startOffset,
          windowY: this.$derivedRows().start.startOffset,
          windowWidth: this.$derivedCols().end.size,
          windowHeight: this.$derivedRows().start.size,
          width: this.$derivedCols().middle.size + this.$derivedCols().end.size,
          height: this.$derivedRows().start.size,
          colResult: this.$derivedCols().middle,
          rowResult: this.$derivedRows().start,
          pinnedX: false,
          pinnedY: true,
        })
        byRender.push(area)
        addToCol(AreaIndex.Middle, AreaIndex.Start, area)
      }
      if (this.$derivedCols().end.size) {
        const area: GridArea<T, R> = new GridArea({
          id: 'topRight',
          pin: AreaPin.xy,
          windowX: this.$viewportWidth() - this.$derivedCols().end.size,
          windowY: this.$derivedRows().start.startOffset,
          windowWidth: this.$derivedCols().end.size,
          windowHeight: this.$derivedRows().start.size,
          width: this.$derivedCols().end.size,
          height: this.$derivedRows().start.size,
          colResult: this.$derivedCols().end,
          rowResult: this.$derivedRows().start,
          pinnedX: true,
          pinnedY: true,
        })
        byRender.push(area)
        addToCol(AreaIndex.End, AreaIndex.Start, area)
      }
      if (this.$derivedCols().start.size) {
        const area: GridArea<T, R> = new GridArea({
          id: 'topLeft',
          pin: AreaPin.xy,
          windowX: 0,
          windowY: this.$derivedRows().start.startOffset,
          windowWidth: this.$derivedCols().start.size,
          windowHeight: this.$derivedRows().start.size,
          width: this.$derivedCols().start.size,
          height: this.$derivedRows().start.size,
          colResult: this.$derivedCols().start,
          rowResult: this.$derivedRows().start,
          pinnedX: true,
          pinnedY: true,
        })
        byRender.push(area)
        addToCol(AreaIndex.Start, AreaIndex.Start, area)
      }
    }

    // Bottom
    if (this.$derivedRows().end.size) {
      if (this.$derivedCols().middle.size) {
        const area: GridArea<T, R> = new GridArea({
          id: 'bottomMiddle',
          pin: AreaPin.y,
          windowX: this.$derivedCols().middle.startOffset,
          windowY: this.$viewportHeight() - this.$derivedRows().end.size,
          windowWidth:
            this.$viewportWidth() -
            this.$derivedCols().start.size -
            this.$derivedCols().end.size,
          width: this.$derivedCols().middle.size + this.$derivedCols().end.size,
          height: this.$derivedRows().end.size,
          windowHeight: this.$derivedRows().end.size,
          colResult: this.$derivedCols().middle,
          rowResult: this.$derivedRows().end,
          pinnedX: false,
          pinnedY: true,
        })
        byRender.push(area)
        addToCol(AreaIndex.Middle, AreaIndex.End, area)
      }
      if (this.$derivedCols().end.size) {
        const area: GridArea<T, R> = new GridArea({
          id: 'bottomRight',
          pin: AreaPin.xy,
          windowX: this.$viewportWidth() - this.$derivedCols().end.size,
          windowY: this.$viewportHeight() - this.$derivedRows().end.size,
          windowWidth: this.$derivedCols().end.size,
          windowHeight: this.$derivedRows().end.size,
          width: this.$derivedCols().end.size,
          height: this.$derivedRows().end.size,
          colResult: this.$derivedCols().end,
          rowResult: this.$derivedRows().end,
          pinnedX: true,
          pinnedY: true,
        })
        byRender.push(area)
        addToCol(AreaIndex.End, AreaIndex.End, area)
      }
      if (this.$derivedCols().start.size) {
        const area: GridArea<T, R> = new GridArea({
          id: 'bottomLeft',
          pin: AreaPin.xy,
          windowX: 0,
          windowY: this.$viewportHeight() - this.$derivedRows().end.size,
          windowWidth: this.$derivedCols().start.size,
          windowHeight: this.$derivedRows().end.size,
          width: this.$derivedCols().start.size,
          height: this.$derivedRows().end.size,
          colResult: this.$derivedCols().start,
          rowResult: this.$derivedRows().end,
          pinnedX: true,
          pinnedY: true,
        })
        byRender.push(area)
        addToCol(AreaIndex.Start, AreaIndex.End, area)
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
        width: this.$viewportWidth(),
        height: this.$viewportHeight(),
      })
    )
    effect(() => props.onContentHeightChanged(this.$contentHeight()))
    effect(() => props.onHeaderHeightChanged(this.$headerHeight()))
    effect(() => props.onMiddleColsChange(this.$middleCols()))
    effect(() => props.onMiddleRowsChange(this.$middleRows()))
  }

  mount(gridEl: HTMLDivElement) {
    this.mounted = true
    this.gridEl = gridEl
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

  onResize: ResizeObserverCallback = throttle(([{ contentRect }]) => {
    this.$viewportWidth.set(contentRect.width)
    this.$viewportHeight.set(contentRect.height)

    Object.values(this.$plugins()).forEach(plugin => {
      if (plugin?.onResize) {
        plugin.onResize(contentRect.width, contentRect.height)
      }
    })
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
