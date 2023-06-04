import { root, signal, computed, effect } from '@maverick-js/signals'
import {
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
  DerivedColsResult,
  DerivedRowsResult,
  deriveColumns,
  deriveRows,
  getColumnWindow,
  getRowWindow,
  getScrollBarSize,
  willScrollbarsAppear,
} from './utils'
import { AreaPin, GridArea } from './GridArea'

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
  onRowsChanged: (derivedRows: DerivedRowsResult<T>) => void
  onAreasChanged: (gridAreas: GridArea<T, R>[]) => void
  onViewportChanged: ({ width, height }: Viewport) => void
  onContentHeightChanged: (value: number) => void
  onHeaderHeightChanged: (value: number) => void
  onMiddleColsChange: (cols: DerivedColumn<T, R>[]) => void
  onMiddleRowsChange: (rows: DerivedRow<T>[]) => void
  onScrollbarSizeChange: ({ width, height }: Viewport) => void
}

interface GridManagerDynamicProps<T, R> {
  columns: GroupedColumns<T, R>
  headerRowHeight: number
  data: T[]
  pinnedTopData: T[]
  pinnedBottomData: T[]
  rowState: RowState
}

class GridManager<T, R> {
  sizeObserver?: ResizeObserver
  scrollbarSize = getScrollBarSize() // TODO: Make this DOM agnostic, or bail if not DOM and do 0 (touch)

  // Static props
  getRowId: GetRowId<T>
  getRowMeta: GetRowMeta<T>
  getRowDetailsMeta: GetRowDetailsMeta<T>
  renderRowDetails: RenderRowDetails<T, R>
  onRowStateChange: OnRowStateChange

  // Dynamic props
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
  $availableWidth = computed(() => this.$viewportWidth() - this.$scrollbarWidth())
  $availableHeight = computed(() => this.$viewportHeight() - this.$scrollbarHeight())

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
          windowX:
            this.$viewportWidth() - this.$derivedCols().end.size - this.$scrollbarWidth(),
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
          windowX:
            this.$viewportWidth() - this.$derivedCols().end.size - this.$scrollbarWidth(),
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
          windowY:
            this.$viewportHeight() -
            this.$derivedRows().end.size -
            this.$scrollbarHeight(),
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
          windowX:
            this.$viewportWidth() - this.$derivedCols().end.size - this.$scrollbarWidth(),
          windowY:
            this.$viewportHeight() -
            this.$derivedRows().end.size -
            this.$scrollbarHeight(),
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
          windowY:
            this.$viewportHeight() -
            this.$derivedRows().end.size -
            this.$scrollbarHeight(),
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
    effect(() => props.onRowsChanged(this.$derivedRows()))
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
    effect(() =>
      props.onScrollbarSizeChange({
        width: this.$scrollbarWidth(),
        height: this.$scrollbarHeight(),
      })
    )
  }

  update(props: GridManagerDynamicProps<T, R>) {
    this.$columns.set(props.columns)
    this.$headerRowHeight.set(props.headerRowHeight)
    this.$data.set(props.data)
    this.$pinnedTopData.set(props.pinnedTopData)
    this.$pinnedBottomData.set(props.pinnedBottomData)
    this.$rowState.set(props.rowState)
  }

  updateScroll = (scrollX: number, scrollY: number) => {
    this.$scrollX.set(scrollX)
    this.$scrollY.set(scrollY)
  }

  updateViewport = (viewportWidth: number, viewportHeight: number) => {
    this.$viewportWidth.set(viewportWidth)
    this.$viewportHeight.set(viewportHeight)
  }

  onKeyDown = (key: string, metaKey: boolean, shiftKey: boolean) => {
    console.log('onKeyDown', key, metaKey, shiftKey)
  }
}

export function createGridManager<T, R>(props: GridManagerStaticProps<T, R>) {
  return root(() => new GridManager(props))
}
