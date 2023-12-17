import { root, signal, computed, effect } from '@maverick-js/signals'
import throttle from 'lodash-es/throttle'

import {
  AreaPos,
  CellPosition,
  CellSelection,
  DerivedColsResult,
  DerivedColumn,
  DerivedRow,
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
  onMiddleColsChange: (cols: DerivedColumn<T, N>[]) => void
  onMiddleRowsChange: (rows: DerivedRow<T>[]) => void
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
    findColumn(this.$columns(), c => Boolean(c.sortable && c.sortDirection))
  )
  $comparators = computed(() =>
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
  $derivedData = computed(() => {
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
  $headerHeight = computed(() =>
    getHeaderHeight(this.$columns(), this.$headerRowHeight(), this.$filterRowHeight())
  )

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
      this.$derivedData(),
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

  $contentHeight = computed(() => this.$headerHeight() + this.$derivedRows().size)

  $verticalScrollSize = computed(() =>
    this.$viewportHeight() && this.$contentHeight() > this.$viewportHeight()
      ? this.scrollbarSize
      : 0
  )

  $derivedCols = computed(() =>
    deriveColumns(this.$columns(), this.$viewportWidth() - this.$verticalScrollSize())
  )

  $horizontalScrollSize = computed(() =>
    this.$viewportWidth() &&
    this.$derivedCols().size > this.$viewportWidth() - this.$verticalScrollSize()
      ? this.scrollbarSize
      : 0
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
  $colHeaderWindow = computed(() =>
    getColumnWindow(
      this.$midWidth(),
      this.$scrollX(),
      this.$derivedCols().middle.itemsWithGrouping
    )
  )
  $middleHeaderCols = computed(() =>
    this.$derivedCols().middle.itemsWithGrouping.slice(
      this.$colHeaderWindow()[0],
      this.$colHeaderWindow()[1] + 1
    )
  )
  $middleHeaderFlatCols = computed(() =>
    this.$derivedCols().middle.items.slice(
      this.$colHeaderWindow()[0],
      this.$colHeaderWindow()[1] + 1
    )
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

  $headerAreas = computed<HeaderAreaDesc<T, N>[]>(() => {
    const derivedCols = this.$derivedCols()
    const headerRowHeight = this.$headerRowHeight()
    const filterRowHeight = this.$filterRowHeight()
    const headerHeight = this.$headerHeight()
    // In render order
    return [
      {
        id: AreaPos.Middle,
        columns: this.$middleHeaderCols(),
        flatColumns: this.$middleHeaderFlatCols(),
        colAreaPos: AreaPos.Middle,
        headerRowHeight,
        filterRowHeight,
        left: derivedCols.start.size,
        width: derivedCols.middle.size + derivedCols.end.size,
        height: headerHeight,
      },
      {
        id: AreaPos.End,
        columns: derivedCols.end.itemsWithGrouping,
        flatColumns: derivedCols.end.items,
        colAreaPos: AreaPos.End,
        headerRowHeight,
        filterRowHeight,
        left: this.$viewportWidth() - this.$horizontalScrollSize() - derivedCols.end.size,
        width: derivedCols.end.size,
        height: headerHeight,
      },
      {
        id: AreaPos.Start,
        columns: derivedCols.start.itemsWithGrouping,
        flatColumns: derivedCols.start.items,
        colAreaPos: AreaPos.Start,
        headerRowHeight,
        filterRowHeight,
        left: 0,
        width: derivedCols.start.size,
        height: headerHeight,
      },
    ]
  })

  // -- Grid areas (pushed in render order)
  $areas = computed(() => {
    const byRender: BodyAreaDesc<T, N>[] = []
    const byCol: BodyAreaDesc<T, N>[][] = []

    const addToCol = (colIndex: number, rowIndex: number, area: BodyAreaDesc<T, N>) => {
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
    const endX =
      this.$viewportWidth() - derivedCols.end.size - this.$horizontalScrollSize()
    const endY =
      this.$viewportHeight() - derivedRows.end.size - this.$horizontalScrollSize()

    // Main
    if (derivedRows.middle.size) {
      if (derivedCols.middle.size) {
        const area: BodyAreaDesc<T, N> = {
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
          lastY: !derivedCols.end.size,
        }
        byRender.push(area)
        addToCol(AreaPos.Middle, AreaPos.Middle, area)
      }
      if (derivedCols.end.size) {
        const area: BodyAreaDesc<T, N> = {
          id: 'mainEnd',
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
          lastY: !derivedCols.end.size,
        }
        byRender.push(area)
        addToCol(AreaPos.End, AreaPos.Middle, area)
      }
      if (derivedCols.start.size) {
        const area: BodyAreaDesc<T, N> = {
          id: 'mainStart',
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
          lastY: !derivedCols.end.size,
        }
        byRender.push(area)
        addToCol(AreaPos.Start, AreaPos.Middle, area)
      }
    }

    // Top
    if (derivedRows.start.size) {
      if (derivedCols.middle.size) {
        const area: BodyAreaDesc<T, N> = {
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
        byRender.push(area)
        addToCol(AreaPos.Middle, AreaPos.Start, area)
      }
      if (derivedCols.end.size) {
        const area: BodyAreaDesc<T, N> = {
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
        byRender.push(area)
        addToCol(AreaPos.End, AreaPos.Start, area)
      }
      if (derivedCols.start.size) {
        const area: BodyAreaDesc<T, N> = {
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
        byRender.push(area)
        addToCol(AreaPos.Start, AreaPos.Start, area)
      }
    }

    // Bottom
    if (derivedRows.end.size) {
      if (derivedCols.middle.size) {
        const area: BodyAreaDesc<T, N> = {
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
        byRender.push(area)
        addToCol(AreaPos.Middle, AreaPos.End, area)
      }
      if (derivedCols.end.size) {
        const area: BodyAreaDesc<T, N> = {
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
        byRender.push(area)
        addToCol(AreaPos.End, AreaPos.End, area)
      }
      if (derivedCols.start.size) {
        const area: BodyAreaDesc<T, N> = {
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
        byRender.push(area)
        addToCol(AreaPos.Start, AreaPos.End, area)
      }
    }

    return { byCol, byRender }
  })

  // State
  $scrollY = signal(0)
  $scrollX = signal(0)

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
    effect(() => props.onMiddleColsChange(this.$middleCols()))
    effect(() => props.onMiddleRowsChange(this.$middleRows()))
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
    this.$columns.set(props.columns)
    this.$headerRowHeight.set(props.headerRowHeight ?? DEFAULT_HEADER_ROW_HEIGHT)
    this.$filterRowHeight.set(props.filterRowHeight ?? DEFAULT_FILTER_ROW_HEIGHT)
    this.$data.set(props.data)
    this.$pinnedTopData.set(props.pinnedTopData)
    this.$pinnedBottomData.set(props.pinnedBottomData)
    this.$rowState.set(props.rowState)
    this.$multiSort.set(props.multiSort || false)
    this.$enableCellSelection.set(props.enableCellSelection || false)
    this.$enableColumnResize.set(props.enableColumnResize || false)
    this.$enableColumnReorder.set(props.enableColumnReorder || false)
  }

  updateScroll(scrollLeft: number, scrollTop: number) {
    this.$scrollX.set(scrollLeft)
    this.$scrollY.set(scrollTop)
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
    this.$viewportWidth.set(contentRect.width)
    this.$viewportHeight.set(contentRect.height)
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
  return root(() => new GridManager(props))
}
