import { observable, effect, memo } from 'oby'
import throttle from 'lodash-es/throttle'

import {
  AreaPos,
  CellPosition,
  CellSelection,
  DerivedColsResult,
  DerivedRowsResult,
  GetRowDetailsMeta,
  GetRowId,
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
} from './utils'
import type { ColumnResizePlugin, SetColResizeData } from './plugins/ColumnResizePlugin'
import type { ColumnReorderPlugin, SetColReorderKey } from './plugins/ColumnReorderPlugin'
import type { CellSelectionPlugin } from './plugins/CellSelectionPlugin'
import { DEFAULT_FILTER_ROW_HEIGHT, DEFAULT_HEADER_ROW_HEIGHT } from './constants'

type Viewport = { width: number; height: number }

interface GridManagerStaticProps<T, N> {
  getRowId: GetRowId<T>
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
  getRowId: GetRowId<T>
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
  $viewportWidth = observable(0)
  $viewportHeight = observable(0)
  $columns = observable<GroupedColumns<T, N>>([])
  $headerRowHeight = observable(0)
  $filterRowHeight = observable(0)
  $data = observable<T[]>([])
  $pinnedTopData = observable<T[]>([])
  $pinnedBottomData = observable<T[]>([])
  $rowState = observable<RowState>({})
  $multiSort = observable(false)
  $enableCellSelection = observable(false)
  $enableColumnResize = observable(false)
  $enableColumnReorder = observable(false)

  // Derived values
  $sortedColumn = memo(() =>
    findColumn(this.$columns(), c => Boolean(c.sortable && c.sortDirection))
  )
  $comparators = memo(() =>
    flatMapColumns(
      this.$columns(),
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
  $derivedData = memo(() => {
    if (!this.$multiSort()) {
      const sortedColumn = this.$sortedColumn()
      if (!sortedColumn) {
        return this.$data()
      }
      const comparator =
        sortedColumn.createSortComparator?.(sortedColumn.sortDirection!) ||
        createDefaultSortComparator(sortedColumn.getValue, sortedColumn.sortDirection!)

      return this.$data().slice().sort(comparator)
    } else {
      if (!this.$comparators().length) {
        return this.$data()
      }

      return this.$data().slice().sort(createMultiSort(this.$comparators()))
    }
  })

  // Has to be calculated first so that we can calc rows and know if they overflow since
  // vscrollbars will affect available width for derivedCols (and their fractional sizing)
  $headerHeight = memo(() =>
    getHeaderHeight(this.$columns(), this.$headerRowHeight(), this.$filterRowHeight())
  )

  $derivedStartRows = memo(() =>
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
  $derivedMiddleRows = memo(() =>
    deriveRows(
      AreaPos.Middle,
      this.$derivedData(),
      this.$rowState(),
      this.getRowId,
      this.getRowMeta,
      this.getRowDetailsMeta,
      () => this.$headerHeight() + this.$derivedStartRows().size,
      this.$derivedStartRows().items.length
    )
  )
  $derivedEndRows = memo(() =>
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
  $derivedRows = memo<DerivedRowsResult<T>>(() => {
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

  $contentHeight = memo(() => this.$headerHeight() + this.$derivedRows().size)

  $verticalScrollSize = memo(() =>
    this.$viewportHeight() && this.$contentHeight() > this.$viewportHeight()
      ? this.scrollbarSize
      : 0
  )

  $derivedCols = memo(() =>
    deriveColumns(this.$columns(), this.$viewportWidth() - this.$verticalScrollSize())
  )

  $horizontalScrollSize = memo(() =>
    this.$viewportWidth() &&
    this.$derivedCols().size > this.$viewportWidth() - this.$verticalScrollSize()
      ? this.scrollbarSize
      : 0
  )

  // -- Column window.
  // Also `- $verticalScrollSize()` too but a bit of extra overscan is ok
  $midWidth = memo(
    () =>
      this.$viewportWidth() -
      this.$derivedCols().start.size -
      this.$derivedCols().end.size
  )
  $colWindow = memo(() =>
    getColumnWindow(this.$midWidth(), this.$scrollX(), this.$derivedCols().middle.items)
  )
  $middleCols = memo(() =>
    this.$derivedCols().middle.items.slice(this.$colWindow()[0], this.$colWindow()[1] + 1)
  )
  // For simplicity & perf in common case this renders everything in a visible group, even if children
  // of that group go off screen. I think in reality this is unlikely to be an issue unless groups are
  // very wide with many child columns. Otherwise could slice out all but groups from topLevelByIndex
  // but then we'd need to create a new tree of groups without them (array of references so not too bad)
  $middleHeaderCols = memo(() =>
    this.$derivedCols().middle.topLevelByIndex.slice(
      this.getFirstDefinedRev(
        this.$derivedCols().middle.topLevelByIndex,
        this.$colWindow()[0]
      ),
      this.getFirstDefinedFwd(
        this.$derivedCols().middle.topLevelByIndex,
        this.$colWindow()[1]
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
  // Also `- $horizontalScrollSize()` too but a bit of extra overscan is ok
  $midHeight = memo(
    () =>
      this.$viewportHeight() -
      this.$headerHeight() -
      this.$derivedRows().start.size -
      this.$derivedRows().end.size
  )
  $rowWindow = memo(() =>
    getRowWindow(this.$midHeight(), this.$scrollY(), this.$derivedRows().middle.items)
  )
  $middleRows = memo(() =>
    this.$derivedRows().middle.items.slice(this.$rowWindow()[0], this.$rowWindow()[1] + 1)
  )

  $headerAreas = memo<HeaderAreaDesc<T, N>[]>(() => {
    const derivedCols = this.$derivedCols()
    const headerRowHeight = this.$headerRowHeight()
    const filterRowHeight = this.$filterRowHeight()
    const headerHeight = this.$headerHeight()
    const areas: HeaderAreaDesc<T, N>[] = []

    // In render order
    if (this.$middleCols().length) {
      areas.push({
        columns: this.$middleHeaderCols(),
        flatColumns: this.$middleCols(), // Remove
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
        left: this.$viewportWidth() - this.$horizontalScrollSize() - derivedCols.end.size,
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
  $topStartArea = memo<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows()
    const derivedCols = this.$derivedCols()

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
  $topMiddleArea = memo<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows()
    const derivedCols = this.$derivedCols()
    const middleWidth =
      this.$viewportWidth() - derivedCols.start.size - derivedCols.end.size

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
  $topEndArea = memo<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows()
    const derivedCols = this.$derivedCols()
    const endX =
      this.$viewportWidth() - derivedCols.end.size - this.$horizontalScrollSize()

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
  $middleRowResult = memo(() => ({
    ...this.$derivedRows().middle,
    items: this.$middleRows(),
  }))
  $mainStartArea = memo<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows()
    const derivedCols = this.$derivedCols()
    const middleHeight =
      this.$viewportHeight() - derivedRows.middle.startOffset - derivedRows.end.size

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
        rowResult: this.$middleRowResult(),
        pinnedX: true,
        pinnedY: false,
        lastY: !derivedCols.end.size,
      }
    }
  })
  $mainMiddleArea = memo<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows()
    const derivedCols = this.$derivedCols()
    const middleWidth =
      this.$viewportWidth() - derivedCols.start.size - derivedCols.end.size
    const middleHeight =
      this.$viewportHeight() - derivedRows.middle.startOffset - derivedRows.end.size

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
          items: this.$middleCols(),
        },
        rowResult: this.$middleRowResult(),
        pinnedX: false,
        pinnedY: false,
        lastY: !derivedCols.end.size,
      }
    }
  })
  $mainEndArea = memo<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows()
    const derivedCols = this.$derivedCols()
    const middleHeight =
      this.$viewportHeight() - derivedRows.middle.startOffset - derivedRows.end.size
    const endX =
      this.$viewportWidth() - derivedCols.end.size - this.$horizontalScrollSize()

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
        rowResult: this.$middleRowResult(),
        pinnedX: true,
        pinnedY: false,
        lastY: !derivedCols.end.size,
      }
    }
  })
  $bottomStartArea = memo<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows()
    const derivedCols = this.$derivedCols()
    const endY =
      this.$viewportHeight() - derivedRows.end.size - this.$horizontalScrollSize()

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
  $bottomMiddleArea = memo<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows()
    const derivedCols = this.$derivedCols()
    const middleWidth =
      this.$viewportWidth() - derivedCols.start.size - derivedCols.end.size
    const endY =
      this.$viewportHeight() - derivedRows.end.size - this.$horizontalScrollSize()

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
  $bottomEndArea = memo<BodyAreaDesc<T, N> | undefined>(() => {
    const derivedRows = this.$derivedRows()
    const derivedCols = this.$derivedCols()
    const endX =
      this.$viewportWidth() - derivedCols.end.size - this.$horizontalScrollSize()
    const endY =
      this.$viewportHeight() - derivedRows.end.size - this.$horizontalScrollSize()

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

  $areas = memo(() => {
    const byRender: BodyAreaDesc<T, N>[] = []
    const byCol: BodyAreaDesc<T, N>[][] = []

    const startColAreas: BodyAreaDesc<T, N>[] = []
    const middleColAreas: BodyAreaDesc<T, N>[] = []
    const endColAreas: BodyAreaDesc<T, N>[] = []

    // Main
    const mainStartArea = this.$mainStartArea()
    const mainMiddleArea = this.$mainMiddleArea()
    const mainEndArea = this.$mainEndArea()

    if (mainMiddleArea) {
      byRender.push(mainMiddleArea)
      middleColAreas.push(mainMiddleArea)
    }
    if (mainEndArea) {
      byRender.push(mainEndArea)
      middleColAreas.push(mainEndArea)
    }
    if (mainStartArea) {
      byRender.push(mainStartArea)
      middleColAreas.push(mainStartArea)
    }

    // Top
    const topStartArea = this.$topStartArea()
    const topMiddleArea = this.$topMiddleArea()
    const topEndArea = this.$topEndArea()

    if (topMiddleArea) {
      byRender.push(topMiddleArea)
      startColAreas.unshift(topMiddleArea)
    }
    if (topEndArea) {
      byRender.push(topEndArea)
      startColAreas.unshift(topEndArea)
    }
    if (topStartArea) {
      byRender.push(topStartArea)
      startColAreas.unshift(topStartArea)
    }

    // Bottom
    const bottomStartArea = this.$bottomStartArea()
    const bottomMiddleArea = this.$bottomMiddleArea()
    const bottomEndArea = this.$bottomEndArea()

    if (bottomMiddleArea) {
      byRender.push(bottomMiddleArea)
      endColAreas.push(bottomMiddleArea)
    }
    if (bottomEndArea) {
      byRender.push(bottomEndArea)
      endColAreas.push(bottomEndArea)
    }
    if (bottomStartArea) {
      byRender.push(bottomStartArea)
      endColAreas.push(bottomStartArea)
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
  $scrollY = observable(0)
  $scrollX = observable(0)

  constructor(props: GridManagerStaticProps<T, N>) {
    this.getRowId = props.getRowId
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
      const enabled = this.$enableCellSelection()
      if (enabled) {
        this.enableCellSelectionPlugin()
      } else {
        this.cellSelectionPlugin?.unmount()
      }
    })

    effect(() => {
      const enabled = this.$enableColumnResize()
      if (enabled) {
        this.enableColumnResizePlugin()
      } else {
        this.columnResizePlugin?.unmount()
      }
    })

    effect(() => {
      const enabled = this.$enableColumnReorder()
      if (enabled) {
        this.enableColumnReorderPlugin()
      } else {
        this.columnReorderPlugin?.unmount()
      }
    })

    // Propagate changes to props
    effect(() => props.onDerivedColumnsChange(this.$derivedCols()))
    effect(() => props.onAreasChanged(this.$areas().byRender))
    effect(() => props.onHeadersChanged(this.$headerAreas()))
    effect(() =>
      props.onViewportChanged({
        width: this.$viewportWidth() - this.$verticalScrollSize(),
        height: this.$viewportHeight() - this.$horizontalScrollSize(),
      })
    )
    effect(() => props.onContentHeightChanged(this.$contentHeight()))
    effect(() => props.onHeaderHeightChanged(this.$headerHeight()))
  }

  mount(gridEl: HTMLDivElement, scrollEl: HTMLDivElement, viewportEl: HTMLDivElement) {
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
    this.$columns(props.columns)
    this.$headerRowHeight(props.headerRowHeight ?? DEFAULT_HEADER_ROW_HEIGHT)
    this.$filterRowHeight(props.filterRowHeight ?? DEFAULT_FILTER_ROW_HEIGHT)
    this.$data(props.data)
    this.$pinnedTopData(props.pinnedTopData)
    this.$pinnedBottomData(props.pinnedBottomData)
    this.$rowState(props.rowState)
    this.$multiSort(props.multiSort || false)
    this.$enableCellSelection(props.enableCellSelection || false)
    this.$enableColumnResize(props.enableColumnResize || false)
    this.$enableColumnReorder(props.enableColumnReorder || false)
  }

  updateScroll(scrollLeft: number, scrollTop: number) {
    this.$scrollX(scrollLeft)
    this.$scrollY(scrollTop)
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
    this.$viewportWidth(contentRect.width)
    this.$viewportHeight(contentRect.height)
  }, 30)

  columnsHaveFilters() {
    return this.$derivedCols().hasFilters
  }

  changeSort(columnKey: ItemId) {
    if (!this.onColumnsChange) {
      console.error('onColumnsChange prop is required to enable column sorting')
      return
    }

    const multiSort = this.$multiSort()

    // Update columns, we derived sorting columns and sort the data once
    // we receive new $columns
    const nextColumns = mapColumns(this.$columns(), column => {
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
    const { CellSelectionPlugin } = await import('./plugins/CellSelectionPlugin')
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
    const { ColumnReorderPlugin } = await import('./plugins/ColumnReorderPlugin')
    this.columnReorderPlugin = new ColumnReorderPlugin(this)
  }
}

export function createGridManager<T, N>(props: GridManagerStaticProps<T, N>) {
  return new GridManager(props)
}
