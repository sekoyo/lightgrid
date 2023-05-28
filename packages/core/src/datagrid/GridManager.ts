import { root, signal, computed, effect } from '@maverick-js/signals'
import {
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

interface GridManagerStaticProps<T, R> {
  getRowId: GetRowId<T>
  getRowMeta: GetRowMeta<T>
  getRowDetailsMeta: GetRowDetailsMeta<T>
  renderRowDetails: RenderRowDetails<T, R>
  onRowStateChange: OnRowStateChange
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
  scrollbarSize = getScrollBarSize()

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
  $totalHeight = computed(() => this.$headerHeight() + this.$bodyHeight())
  $hasScroll = computed(() =>
    willScrollbarsAppear(
      this.$viewportWidth(),
      this.$viewportHeight(),
      this.$derivedCols().size,
      this.$totalHeight(),
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
    getColumnWindow(
      this.$midWidth(),
      this.$scrollLeft(),
      this.$derivedCols().middle.items
    )
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
    getRowWindow(this.$midHeight(), this.$scrollTop(), this.$derivedRows().middle.items)
  )
  $middleRows = computed(() =>
    this.$derivedRows().middle.items.slice(this.$rowWindow()[0], this.$rowWindow()[1] + 1)
  )

  // -- Grid areas (pushed in render order)
  $areas = computed(() => {
    const areas: GridArea<T, R>[] = []
    // Main
    if (this.$derivedRows().middle.size) {
      if (this.$derivedCols().middle.size) {
        areas.push(
          new GridArea({
            id: 'mainMiddle',
            absX: this.$derivedCols().middle.startOffset,
            absY: this.$derivedRows().middle.startOffset,
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
            colResult: this.$derivedCols().middle,
            rowResult: this.$derivedRows().middle,
          })
        )
      }
      if (this.$derivedCols().end.size) {
        areas.push(
          new GridArea({
            id: 'mainRight',
            pin: AreaPin.x,
            absX: this.$derivedCols().end.startOffset,
            absY: this.$derivedRows().middle.startOffset,
            windowX: this.$viewportWidth() - this.$derivedCols().end.size,
            windowY: this.$derivedRows().middle.startOffset,
            windowWidth: this.$derivedCols().end.size,
            windowHeight:
              this.$viewportHeight() -
              this.$derivedRows().start.startOffset -
              this.$derivedRows().end.size,
            colResult: this.$derivedCols().end,
            rowResult: this.$derivedRows().middle,
          })
        )
      }
      if (this.$derivedCols().start.size) {
        areas.push(
          new GridArea({
            id: 'mainLeft',
            pin: AreaPin.x,
            absX: 0,
            absY: this.$derivedRows().middle.startOffset,
            windowX: 0,
            windowY: this.$derivedRows().middle.startOffset,
            windowWidth: this.$derivedCols().start.size,
            windowHeight:
              this.$viewportHeight() -
              this.$derivedRows().start.startOffset -
              this.$derivedRows().end.size,
            colResult: this.$derivedCols().start,
            rowResult: this.$derivedRows().middle,
          })
        )
      }
    }

    // Top
    if (this.$derivedRows().start.size) {
      if (this.$derivedCols().middle.size) {
        areas.push(
          new GridArea({
            id: 'topMiddle',
            pin: AreaPin.y,
            absX: this.$derivedCols().middle.startOffset,
            absY: this.$derivedRows().start.startOffset,
            windowX: this.$derivedCols().middle.startOffset,
            windowY: this.$derivedRows().start.startOffset,
            windowWidth: this.$derivedCols().end.size,
            windowHeight: this.$derivedRows().start.size,
            colResult: this.$derivedCols().middle,
            rowResult: this.$derivedRows().start,
          })
        )
      }
      if (this.$derivedCols().end.size) {
        areas.push(
          new GridArea({
            id: 'topRight',
            pin: AreaPin.xy,
            absX: this.$derivedCols().end.startOffset,
            absY: this.$derivedRows().start.startOffset,
            windowX: this.$viewportWidth() - this.$derivedCols().end.size,
            windowY: this.$derivedRows().start.size,
            windowWidth: this.$derivedCols().end.size,
            windowHeight: this.$derivedRows().start.size,
            colResult: this.$derivedCols().end,
            rowResult: this.$derivedRows().start,
          })
        )
      }
      if (this.$derivedCols().start.size) {
        areas.push(
          new GridArea({
            id: 'topLeft',
            pin: AreaPin.xy,
            absX: 0,
            absY: this.$derivedRows().start.startOffset,
            windowX: 0,
            windowY: this.$derivedRows().start.size,
            windowWidth: this.$derivedCols().start.size,
            windowHeight: this.$derivedRows().start.size,
            colResult: this.$derivedCols().start,
            rowResult: this.$derivedRows().start,
          })
        )
      }
      return areas
    }

    // Bottom
    if (this.$derivedRows().end.size) {
      if (this.$derivedCols().middle.size) {
        areas.push(
          new GridArea({
            id: 'bottomMiddle',
            pin: AreaPin.y,
            absX: this.$derivedCols().middle.startOffset,
            absY: this.$derivedRows().end.startOffset,
            windowX: this.$derivedCols().middle.startOffset,
            windowY: this.$viewportHeight() - this.$derivedRows().end.size,
            windowWidth:
              this.$viewportWidth() -
              this.$derivedCols().start.size -
              this.$derivedCols().end.size,
            windowHeight: this.$derivedRows().end.size,
            colResult: this.$derivedCols().middle,
            rowResult: this.$derivedRows().end,
          })
        )
      }
      if (this.$derivedCols().end.size) {
        areas.push(
          new GridArea({
            id: 'bottomRight',
            pin: AreaPin.xy,
            absX: this.$derivedCols().end.startOffset,
            absY: this.$derivedRows().start.startOffset,
            windowX: this.$viewportWidth() - this.$derivedCols().end.size,
            windowY: this.$viewportHeight() - this.$derivedRows().end.size,
            windowWidth: this.$derivedCols().end.size,
            windowHeight: this.$derivedRows().end.size,
            colResult: this.$derivedCols().end,
            rowResult: this.$derivedRows().end,
          })
        )
      }
      if (this.$derivedCols().start.size) {
        areas.push(
          new GridArea({
            id: 'bottomLeft',
            pin: AreaPin.xy,
            absX: 0,
            absY: this.$derivedRows().start.startOffset,
            windowX: 0,
            windowY: this.$viewportHeight() - this.$derivedRows().end.size,
            windowWidth: this.$derivedCols().start.size,
            windowHeight: this.$derivedRows().end.size,
            colResult: this.$derivedCols().start,
            rowResult: this.$derivedRows().end,
          })
        )
      }
    }
  })

  // State
  $scrollTop = signal(0)
  $scrollLeft = signal(0)

  constructor(props: GridManagerStaticProps<T, R>) {
    this.getRowId = props.getRowId
    this.getRowMeta = props.getRowMeta
    this.getRowDetailsMeta = props.getRowDetailsMeta
    this.renderRowDetails = props.renderRowDetails
    this.onRowStateChange = props.onRowStateChange
  }

  onColumnsChange = effect(() => {
    console.log('Columns changed:', this.$columns())

    // Called each time `effect` ends and when finally disposed.
    return () => {
      console.log('Effect ended')
    }
  })

  mount(el: HTMLDivElement) {
    this.sizeObserver = new ResizeObserver(this.onResize)
    this.sizeObserver.observe(el)
  }

  unmount() {
    this.sizeObserver?.disconnect()
  }

  update(props: GridManagerDynamicProps<T, R>) {
    this.$columns.set(props.columns)
    this.$headerRowHeight.set(props.headerRowHeight)
    this.$pinnedTopData.set(props.pinnedTopData)
    this.$pinnedBottomData.set(props.pinnedBottomData)
    this.$rowState.set(props.rowState)
  }

  onResize = throttle(([{ contentRect }]) => {
    this.$viewportWidth.set(contentRect.width)
    this.$viewportHeight.set(contentRect.height)
  }, 60)

  onScroll = (e: Event) => {
    if (e.currentTarget instanceof HTMLElement) {
      const { scrollTop, scrollLeft } = e.currentTarget
      this.$scrollTop.set(scrollTop)
      this.$scrollLeft.set(scrollLeft)
    }
  }
}

export function createGridManager<T, R>(props: GridManagerStaticProps<T, R>) {
  return root(() => new GridManager(props))
}
