import { signal, effect, computed } from '@preact/signals-core'

import {
  AreaPos,
  CellPosition,
  CellSelection,
  DerivedColsResult,
  DerivedRowsResult,
  GetRowDetailsMeta,
  GetRowKey,
  GetRowMeta,
  BodyAreaDesc,
  GroupedColumns,
  HeaderAreaDesc,
  RenderRowDetails,
  RowState,
  Column,
  ItemId,
  GroupedDerivedColumns,
} from './types'
import {
  createDefaultSortComparator,
  createMultiSort,
  deriveColumns,
  deriveRows,
  findColumn,
  flatMapColumns,
  getColumnWindow,
  getHeaderHeight,
  getNextSortDirection,
  getRowWindow,
  getScrollBarSize,
  isColumnGroup,
  mapColumns,
  throttle,
} from './utils'
import type {
  ColumnResizePlugin,
  SetColResizeData,
} from './plugins/ColumnResizePlugin'
import type {
  ColumnReorderPlugin,
  SetColReorderKey,
} from './plugins/ColumnReorderPlugin'
import type { CellSelectionPlugin } from './plugins/CellSelectionPlugin'
import {
  DEFAULT_FILTER_ROW_HEIGHT,
  DEFAULT_HEADER_ROW_HEIGHT,
} from './constants'

type Viewport = { width: number; height: number }

interface GridManagerStaticProps<T, N> {
  getRowKey: GetRowKey<T>
  getRowMeta: GetRowMeta<T>
  getRowDetailsMeta: GetRowDetailsMeta<T>
  renderRowDetails: RenderRowDetails<T, N>
  setStartCell: (cellPosition: CellPosition | undefined) => void
  setSelection: (cellSelection: CellSelection | undefined) => void
  setColResizeData: SetColResizeData
  setColReorderKey: SetColReorderKey
  onColumnsChange?: (columns: GroupedColumns<T, N>) => void
  onDerivedColumnsChange: (derivedCols: DerivedColsResult<T, N>) => void
  onAreasChanged: (gridAreas: BodyAreaDesc<T, N>[]) => void
  onHeadersChanged: (headerAreas: HeaderAreaDesc<T, N>[]) => void
  onViewportChanged: ({ width, height }: Viewport) => void
  onContentHeightChanged: (value: number) => void
  onHeaderHeightChanged: (value: number) => void
}

interface GridManagerDynamicProps<T, N> {
  columns: GroupedColumns<T, N, any>
  headerRowHeight?: number
  filterRowHeight?: number
  data: T[]
  pinnedTopData: T[]
  pinnedBottomData: T[]
  rowState: RowState
  multiSort?: boolean
  enableCellSelection?: boolean
  enableColumnResize?: boolean
  enableColumnReorder?: boolean
}

export class GridManager<T, N> {
  gridEl?: HTMLDivElement
  scrollEl?: HTMLDivElement
  viewportEl?: HTMLDivElement
  sizeObserver?: ResizeObserver
  scrollbarSize = getScrollBarSize()
  mounted = false

  // Static props
  getRowKey: GetRowKey<T>
  getRowMeta: GetRowMeta<T>
  getRowDetailsMeta: GetRowDetailsMeta<T>
  renderRowDetails: RenderRowDetails<T, N>
  setStartCell: (cellPosition: CellPosition | undefined) => void
  setSelection: (cellSelection: CellSelection | undefined) => void
  setColResizeData: SetColResizeData
  setColReorderKey: SetColReorderKey
  onColumnsChange?: (columns: GroupedColumns<T, N>) => void

  cellSelectionPlugin?: CellSelectionPlugin<T, N>
  columnResizePlugin?: ColumnResizePlugin<T, N>
  columnReorderPlugin?: ColumnReorderPlugin<T, N>

  // Dynamic props
  $viewportWidth = signal(0)
  $viewportHeight = signal(0)
  $columns = signal<GroupedColumns<T, N>>([])
  $headerRowHeight = signal(0)
  $filterRowHeight = signal(0)
  $data = signal<T[]>([])
  $pinnedTopData = signal<T[]>([])
  $pinnedBottomData = signal<T[]>([])
  $rowState = signal<RowState>({})
  $multiSort = signal(false)
  $enableCellSelection = signal(false)
  $enableColumnResize = signal(false)
  $enableColumnReorder = signal(false)

  // Derived values
  $sortedColumn = computed(() =>
    findColumn(this.$columns.value, c => Boolean(c.sortable && c.sortDirection))
  )
  $comparators = computed(() =>
    flatMapColumns(
      this.$columns.value,
      c => c as Column<T, N>,
      c => Boolean(!isColumnGroup(c) && c.sortable && c.sortDirection)
    )
      .sort((a, b) => (a.sortPriority ?? 0) - (b.sortPriority ?? 0))
      .map(
        c =>
          c.createSortComparator?.(c.sortDirection!) ||
          createDefaultSortComparator(c.getValue, c.sortDirection!)
      )
  )
  $derivedData = computed(() => {
    if (!this.$multiSort.value) {
      const sortedColumn = this.$sortedColumn.value
      if (!sortedColumn) {
        return this.$data.value
      }
      const comparator =
        sortedColumn.createSortComparator?.(sortedColumn.sortDirection!) ||
        createDefaultSortComparator(
          sortedColumn.getValue,
          sortedColumn.sortDirection!
        )

      return this.$data.value.slice().sort(comparator)
    } else {
      if (!this.$comparators.value.length) {
        return this.$data.value
      }

      return this.$data.value
        .slice()
        .sort(createMultiSort(this.$comparators.value))
    }
  })

  // Has to be calculated first so that we can calc rows and know if they overflow since
  // vscrollbars will affect available width for derivedCols (and their fractional sizing)
  $headerHeight = computed(() =>
    getHeaderHeight(
      this.$columns.value,
      this.$headerRowHeight.value,
      this.$filterRowHeight.value
    )
  )

  $derivedStartRows = computed(() =>
    deriveRows(
      AreaPos.Start,
      this.$pinnedTopData.value,
      this.$rowState.value,
      this.getRowKey,
      this.getRowMeta,
      this.getRowDetailsMeta,
      () => this.$headerHeight.value,
      0
    )
  )
  $derivedMiddleRows = computed(() =>
    deriveRows(
      AreaPos.Middle,
      this.$derivedData.value,
      this.$rowState.value,
      this.getRowKey,
      this.getRowMeta,
      this.getRowDetailsMeta,
      () => this.$headerHeight.value + this.$derivedStartRows.value.size,
      this.$derivedStartRows.value.items.length
    )
  )
  $derivedEndRows = computed(() =>
    deriveRows(
      AreaPos.End,
      this.$pinnedBottomData.value,
      this.$rowState.value,
      this.getRowKey,
      this.getRowMeta,
      this.getRowDetailsMeta,
      thisSize => this.$viewportHeight.value - thisSize,
      this.$derivedStartRows.value.items.length +
        this.$derivedMiddleRows.value.items.length
    )
  )
  $derivedRows = computed<DerivedRowsResult<T>>(() => {
    const start = this.$derivedStartRows.value
    const middle = this.$derivedMiddleRows.value
    const end = this.$derivedEndRows.value
    return {
      start,
      middle,
      end,
      size: start.size + middle.size + end.size,
      itemCount: start.items.length + middle.items.length + end.items.length,
    }
  })

  $contentHeight = computed(
    () => this.$headerHeight.value + this.$derivedRows.value.size
  )

  $verticalScrollSize = computed(() =>
    this.$viewportHeight.value &&
    this.$contentHeight.value > this.$viewportHeight.value
      ? this.scrollbarSize
      : 0
  )

  $derivedCols = computed(() =>
    deriveColumns(
      this.$columns.value,
      this.$viewportWidth.value - this.$verticalScrollSize.value
    )
  )

  $horizontalScrollSize = computed(() =>
    this.$viewportWidth.value &&
    this.$derivedCols.value.size >
      this.$viewportWidth.value - this.$verticalScrollSize.value
      ? this.scrollbarSize
      : 0
  )

  // -- Column window.
  // Also `- $verticalScrollSize.value` too but a bit of extra overscan is ok
  $midWidth = computed(
    () =>
      this.$viewportWidth.value -
      this.$derivedCols.value.start.size -
      this.$derivedCols.value.end.size
  )
  $colWindow = computed(() =>
    getColumnWindow(
      this.$midWidth.value,
      this.$scrollX.value,
      this.$derivedCols.value.middle.items
    )
  )
  $middleCols = computed(() =>
    this.$derivedCols.value.middle.items.slice(
      this.$colWindow.value[0],
      this.$colWindow.value[1] + 1
    )
  )
  // For simplicity & perf in common case this renders everything in a visible group, even if children
  // of that group go off screen. I think in reality this is unlikely to be an issue unless groups are
  // very wide with many child columns. Otherwise could slice out all but groups from topLevelByIndex
  // but then we'd need to create a new tree of groups without them (array of references so not too bad)
  $middleHeaderCols = computed(() =>
    this.$derivedCols.value.middle.topLevelByIndex.slice(
      this.getFirstDefinedRev(
        this.$derivedCols.value.middle.topLevelByIndex,
        this.$colWindow.value[0]
      ),
      this.getFirstDefinedFwd(
        this.$derivedCols.value.middle.topLevelByIndex,
        this.$colWindow.value[1]
      ) + 1
    )
  )

  getFirstDefinedRev(colResult: GroupedDerivedColumns<T, N>, colIndex: number) {
    for (let i = colIndex; i >= 0; i--) {
      if (colResult[i]) {
        return i
      }
    }
    return 0
  }

  getFirstDefinedFwd(colResult: GroupedDerivedColumns<T, N>, colIndex: number) {
    for (let i = colIndex; i < colResult.length; i++) {
      if (colResult[i]) {
        return i
      }
    }
    return colResult.length - 1
  }

  // -- Row window.
  // Also `- $horizontalScrollSize.value` too but a bit of extra overscan is ok
  $midHeight = computed(
    () =>
      this.$viewportHeight.value -
      this.$headerHeight.value -
      this.$derivedRows.value.start.size -
      this.$derivedRows.value.end.size
  )
  $rowWindow = computed(() =>
    getRowWindow(
      this.$midHeight.value,
      this.$scrollY.value,
      this.$derivedRows.value.middle.items
    )
  )
  $middleRows = computed(() =>
    this.$derivedRows.value.middle.items.slice(
      this.$rowWindow.value[0],
      this.$rowWindow.value[1] + 1
    )
  )

  $headerAreas = computed<HeaderAreaDesc<T, N>[]>(() => {
    const derivedCols = this.$derivedCols.value
    const headerRowHeight = this.$headerRowHeight.value
    const filterRowHeight = this.$filterRowHeight.value
    const headerHeight = this.$headerHeight.value
    const areas: HeaderAreaDesc<T, N>[] = []

    // In render order
    if (this.$middleCols.value.length) {
      areas.push({
        columns: this.$middleHeaderCols.value,
        flatColumns: this.$middleCols.value, // Remove
        colAreaPos: AreaPos.Middle,
        headerRowCount: derivedCols.headerRowCount,
        headerRowHeight,
        filterRowHeight,
        left: derivedCols.start.size,
        width: derivedCols.middle.size + derivedCols.end.size,
        height: headerHeight,
      })
    }
    if (derivedCols.end.items.length) {
      areas.push({
        columns: derivedCols.end.itemsWithGrouping,
        flatColumns: derivedCols.end.items, // Remove
        colAreaPos: AreaPos.End,
        headerRowCount: derivedCols.headerRowCount,
        headerRowHeight,
        filterRowHeight,
        left:
          this.$viewportWidth.value -
          this.$horizontalScrollSize.value -
          derivedCols.end.size,
        width: derivedCols.end.size,
        height: headerHeight,
      })
    }
    if (derivedCols.start.items.length) {
      areas.push({
        columns: derivedCols.start.itemsWithGrouping,
        flatColumns: derivedCols.start.items, // Remove
        colAreaPos: AreaPos.Start,
        headerRowCount: derivedCols.headerRowCount,
        headerRowHeight,
        filterRowHeight,
        left: 0,
        width: derivedCols.start.size,
        height: headerHeight,
      })
    }
    return areas
  })

  // -- Grid areas
  $topStartArea = computed<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows.value
    const derivedCols = this.$derivedCols.value

    if (derivedRows.start.size && derivedCols.start.size) {
      return {
        id: 'topStart',
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
        lastY: !derivedCols.middle.size && !derivedCols.end.size,
      }
    }
  })
  $topMiddleArea = computed<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows.value
    const derivedCols = this.$derivedCols.value
    const middleWidth =
      this.$viewportWidth.value - derivedCols.start.size - derivedCols.end.size

    if (derivedRows.start.size && derivedCols.middle.size) {
      return {
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
        lastY: !derivedCols.middle.size && !derivedCols.end.size,
      }
    }
  })
  $topEndArea = computed<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows.value
    const derivedCols = this.$derivedCols.value
    const endX =
      this.$viewportWidth.value -
      derivedCols.end.size -
      this.$horizontalScrollSize.value

    if (derivedRows.start.size && derivedCols.end.size) {
      return {
        id: 'topEnd',
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
        lastY: !derivedCols.middle.size && !derivedCols.end.size,
      }
    }
  })
  $middleRowResult = computed(() => ({
    ...this.$derivedRows.value.middle,
    items: this.$middleRows.value,
  }))
  $mainStartArea = computed<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows.value
    const derivedCols = this.$derivedCols.value
    const middleHeight =
      this.$viewportHeight.value -
      derivedRows.middle.startOffset -
      derivedRows.end.size

    if (derivedRows.middle.size && derivedCols.start.size) {
      return {
        id: 'mainStart',
        windowX: 0,
        windowY: derivedRows.middle.startOffset,
        windowWidth: derivedCols.start.size,
        windowHeight: middleHeight,
        width: derivedCols.start.size,
        height: derivedRows.middle.size,
        colResult: derivedCols.start,
        rowResult: this.$middleRowResult.value,
        pinnedX: true,
        pinnedY: false,
        lastY: !derivedCols.end.size,
      }
    }
  })
  $mainMiddleArea = computed<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows.value
    const derivedCols = this.$derivedCols.value
    const middleWidth =
      this.$viewportWidth.value - derivedCols.start.size - derivedCols.end.size
    const middleHeight =
      this.$viewportHeight.value -
      derivedRows.middle.startOffset -
      derivedRows.end.size

    if (derivedRows.middle.size && derivedCols.middle.size) {
      return {
        id: 'mainMiddle',
        windowX: derivedCols.middle.startOffset,
        windowY: derivedRows.middle.startOffset,
        windowWidth: middleWidth,
        windowHeight: middleHeight,
        width: derivedCols.middle.size,
        height: derivedRows.middle.size,
        colResult: {
          ...derivedCols.middle,
          items: this.$middleCols.value,
        },
        rowResult: this.$middleRowResult.value,
        pinnedX: false,
        pinnedY: false,
        lastY: !derivedCols.end.size,
      }
    }
  })
  $mainEndArea = computed<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows.value
    const derivedCols = this.$derivedCols.value
    const middleHeight =
      this.$viewportHeight.value -
      derivedRows.middle.startOffset -
      derivedRows.end.size
    const endX =
      this.$viewportWidth.value -
      derivedCols.end.size -
      this.$horizontalScrollSize.value

    if (derivedRows.middle.size && derivedCols.end.size) {
      return {
        id: 'mainEnd',
        windowX: endX,
        windowY: derivedRows.middle.startOffset,
        windowWidth: derivedCols.end.size,
        windowHeight: middleHeight,
        width: derivedCols.end.size,
        height: derivedRows.middle.size,
        colResult: derivedCols.end,
        rowResult: this.$middleRowResult.value,
        pinnedX: true,
        pinnedY: false,
        lastY: !derivedCols.end.size,
      }
    }
  })
  $bottomStartArea = computed<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows.value
    const derivedCols = this.$derivedCols.value
    const endY =
      this.$viewportHeight.value -
      derivedRows.end.size -
      this.$horizontalScrollSize.value

    if (derivedRows.end.size && derivedCols.start.size) {
      return {
        id: 'bottomStart',
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
        lastY: true,
      }
    }
  })
  $bottomMiddleArea = computed<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows.value
    const derivedCols = this.$derivedCols.value
    const middleWidth =
      this.$viewportWidth.value - derivedCols.start.size - derivedCols.end.size
    const endY =
      this.$viewportHeight.value -
      derivedRows.end.size -
      this.$horizontalScrollSize.value

    if (derivedRows.end.size && derivedCols.middle.size) {
      return {
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
        lastY: true,
      }
    }
  })
  $bottomEndArea = computed<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows.value
    const derivedCols = this.$derivedCols.value
    const endX =
      this.$viewportWidth.value -
      derivedCols.end.size -
      this.$horizontalScrollSize.value
    const endY =
      this.$viewportHeight.value -
      derivedRows.end.size -
      this.$horizontalScrollSize.value

    if (derivedRows.end.size && derivedCols.end.size) {
      return {
        id: 'bottomEnd',
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
        lastY: true,
      }
    }
  })

  $areas = computed(() => {
    const byRender: BodyAreaDesc<T, N>[] = []
    const byCol: BodyAreaDesc<T, N>[][] = []

    const startColAreas: BodyAreaDesc<T, N>[] = []
    const middleColAreas: BodyAreaDesc<T, N>[] = []
    const endColAreas: BodyAreaDesc<T, N>[] = []

    // Main
    const mainStartArea = this.$mainStartArea.value
    const mainMiddleArea = this.$mainMiddleArea.value
    const mainEndArea = this.$mainEndArea.value

    if (mainMiddleArea) {
      byRender.push(mainMiddleArea)
      middleColAreas.push(mainMiddleArea)
    }
    if (mainEndArea) {
      byRender.push(mainEndArea)
      endColAreas.push(mainEndArea)
    }
    if (mainStartArea) {
      byRender.push(mainStartArea)
      startColAreas.push(mainStartArea)
    }

    // Top
    const topStartArea = this.$topStartArea.value
    const topMiddleArea = this.$topMiddleArea.value
    const topEndArea = this.$topEndArea.value

    if (topMiddleArea) {
      byRender.push(topMiddleArea)
      middleColAreas.unshift(topMiddleArea)
    }
    if (topEndArea) {
      byRender.push(topEndArea)
      endColAreas.unshift(topEndArea)
    }
    if (topStartArea) {
      byRender.push(topStartArea)
      startColAreas.unshift(topStartArea)
    }

    // Bottom
    const bottomStartArea = this.$bottomStartArea.value
    const bottomMiddleArea = this.$bottomMiddleArea.value
    const bottomEndArea = this.$bottomEndArea.value

    if (bottomMiddleArea) {
      byRender.push(bottomMiddleArea)
      middleColAreas.push(bottomMiddleArea)
    }
    if (bottomEndArea) {
      byRender.push(bottomEndArea)
      endColAreas.push(bottomEndArea)
    }
    if (bottomStartArea) {
      byRender.push(bottomStartArea)
      startColAreas.push(bottomStartArea)
    }

    if (startColAreas.length) {
      byCol.push(startColAreas)
    }
    if (middleColAreas.length) {
      byCol.push(middleColAreas)
    }
    if (endColAreas.length) {
      byCol.push(endColAreas)
    }

    return { byCol, byRender }
  })

  // State
  $scrollY = signal(0)
  $scrollX = signal(0)

  constructor(props: GridManagerStaticProps<T, N>) {
    this.getRowKey = props.getRowKey
    this.getRowMeta = props.getRowMeta
    this.getRowDetailsMeta = props.getRowDetailsMeta
    this.renderRowDetails = props.renderRowDetails
    this.onColumnsChange = props.onColumnsChange

    this.setStartCell = props.setStartCell
    this.setSelection = props.setSelection
    this.setColResizeData = props.setColResizeData
    this.setColReorderKey = props.setColReorderKey

    // Lazily load plugins
    effect(() => {
      const enabled = this.$enableCellSelection.value
      if (enabled) {
        this.enableCellSelectionPlugin()
      } else {
        this.cellSelectionPlugin?.unmount()
      }
    })

    effect(() => {
      const enabled = this.$enableColumnResize.value
      if (enabled) {
        this.enableColumnResizePlugin()
      } else {
        this.columnResizePlugin?.unmount()
      }
    })

    effect(() => {
      const enabled = this.$enableColumnReorder.value
      if (enabled) {
        this.enableColumnReorderPlugin()
      } else {
        this.columnReorderPlugin?.unmount()
      }
    })

    // Propagate changes to props
    effect(() => props.onDerivedColumnsChange(this.$derivedCols.value))
    effect(() => props.onAreasChanged(this.$areas.value.byRender))
    effect(() => props.onHeadersChanged(this.$headerAreas.value))
    effect(() =>
      props.onViewportChanged({
        width: this.$viewportWidth.value - this.$verticalScrollSize.value,
        height: this.$viewportHeight.value - this.$horizontalScrollSize.value,
      })
    )
    effect(() => props.onContentHeightChanged(this.$contentHeight.value))
    effect(() => props.onHeaderHeightChanged(this.$headerHeight.value))
  }

  mount(
    gridEl: HTMLDivElement,
    scrollEl: HTMLDivElement,
    viewportEl: HTMLDivElement
  ) {
    if (!this.mounted) {
      this.mounted = true
      this.gridEl = gridEl
      this.scrollEl = scrollEl
      this.viewportEl = viewportEl
      this.sizeObserver = new ResizeObserver(this.onResize)
      this.sizeObserver.observe(gridEl)
      this.cellSelectionPlugin?.mount()
    }

    return () => this.unmount()
  }

  unmount() {
    if (this.mounted) {
      this.sizeObserver?.disconnect()
      this.onResize.cancel()
      this.cellSelectionPlugin?.unmount()
      this.columnResizePlugin?.unmount()
      this.columnReorderPlugin?.unmount()
      this.mounted = false
    }
  }

  update(props: GridManagerDynamicProps<T, N>) {
    this.$columns.value = props.columns
    this.$headerRowHeight.value =
      props.headerRowHeight ?? DEFAULT_HEADER_ROW_HEIGHT
    this.$filterRowHeight.value =
      props.filterRowHeight ?? DEFAULT_FILTER_ROW_HEIGHT
    this.$data.value = props.data
    this.$pinnedTopData.value = props.pinnedTopData
    this.$pinnedBottomData.value = props.pinnedBottomData
    this.$rowState.value = props.rowState
    this.$multiSort.value = props.multiSort || false
    this.$enableCellSelection.value = props.enableCellSelection || false
    this.$enableColumnResize.value = props.enableColumnResize || false
    this.$enableColumnReorder.value = props.enableColumnReorder || false
  }

  updateScroll(scrollLeft: number, scrollTop: number) {
    this.$scrollX.value = scrollLeft
    this.$scrollY.value = scrollTop
  }

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
    this.$viewportWidth.value = contentRect.width
    this.$viewportHeight.value = contentRect.height
  }, 30)

  columnsHaveFilters() {
    return this.$derivedCols.value.hasFilters
  }

  changeSort(columnKey: ItemId) {
    if (this.columnResizePlugin?.isResizing()) {
      return
    }
    if (!this.onColumnsChange) {
      console.error('onColumnsChange prop is required to enable column sorting')
      return
    }

    const multiSort = this.$multiSort.value

    // Update columns, we derived sorting columns and sort the data once
    // we receive new $columns
    const nextColumns = mapColumns(this.$columns.value, column => {
      if (!isColumnGroup(column)) {
        if (columnKey === column.key) {
          return {
            ...column,
            sortDirection: getNextSortDirection(column.sortDirection),
            sortPriority: Date.now(),
          }
        } else if (!multiSort && column.sortDirection) {
          // In single sort mode unsort other columns
          return {
            ...column,
            sortDirection: undefined,
          }
        }
      }
      return column
    })

    this.onColumnsChange(nextColumns)
  }

  async enableCellSelectionPlugin() {
    const { CellSelectionPlugin } = await import(
      './plugins/CellSelectionPlugin'
    )
    this.cellSelectionPlugin = new CellSelectionPlugin(
      this,
      this.setStartCell,
      this.setSelection
    )
    if (this.mounted) {
      this.cellSelectionPlugin.mount()
    }
  }

  async enableColumnResizePlugin() {
    const { ColumnResizePlugin } = await import('./plugins/ColumnResizePlugin')
    this.columnResizePlugin = new ColumnResizePlugin(this)
  }

  async enableColumnReorderPlugin() {
    const { ColumnReorderPlugin } = await import(
      './plugins/ColumnReorderPlugin'
    )
    this.columnReorderPlugin = new ColumnReorderPlugin(this)
  }

  scrollToCell = ({
    columnKey,
    rowKey,
  }: {
    columnKey?: ItemId
    rowKey?: ItemId
  }) => {
    let colOffset: number | undefined
    let rowOffset: number | undefined

    if (columnKey) {
      const cols = this.$derivedCols.value
      const joinedItems = [
        ...cols.start.items,
        ...cols.middle.items,
        ...cols.end.items,
      ]
      colOffset = joinedItems.find(c => c.key === columnKey)?.offset
      if (!colOffset) {
        console.warn(`Column with key ${columnKey} not found`)
      }
    }

    if (rowKey) {
      const rows = this.$derivedRows.value
      const joinedItems = [
        ...rows.start.items,
        ...rows.middle.items,
        ...rows.end.items,
      ]
      rowOffset = joinedItems.find(c => c.rowKey === rowKey)?.offset
      if (!rowOffset) {
        console.warn(`Row with key ${rowKey} not found`)
      }
    }

    if (colOffset && rowOffset) {
      this.scrollTo(colOffset, rowOffset)
    } else if (rowOffset) {
      this.scrollTop(rowOffset)
    } else if (colOffset) {
      this.scrollLeft(colOffset)
    }
  }

  getImperativeApi() {
    return {
      scrollTo: this.scrollToCell,
    }
  }
}

export function createGridManager<T, N>(props: GridManagerStaticProps<T, N>) {
  return new GridManager(props)
}
