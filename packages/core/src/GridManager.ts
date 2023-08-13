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
  OnRowStateChange,
  RenderRowDetails,
  RowState,
  Column,
} from './types'
import {
  createDefaultSortComparator,
  createMultiSort,
  deriveColumns,
  deriveRows,
  flatMapColumns,
  getColumnWindow,
  getNextSortDirection,
  getRowWindow,
  getScrollBarSize,
  isColumnGroup,
  updateColumn,
  willScrollbarsAppear,
} from './utils'
import type { ColumnResizePlugin, SetColResizeData } from './plugins/ColumnResizePlugin'
import type { ColumnReorderPlugin, SetColReorderKey } from './plugins/ColumnReorderPlugin'
import type { CellSelectionPlugin } from './plugins/CellSelectionPlugin'

type Viewport = { width: number; height: number }

interface GridManagerStaticProps<T, R> {
  getRowId: GetRowId<T>
  getRowMeta: GetRowMeta<T>
  getRowDetailsMeta: GetRowDetailsMeta<T>
  renderRowDetails: RenderRowDetails<T, R>
  setStartCell: (cellPosition: CellPosition | undefined) => void
  setSelection: (cellSelection: CellSelection | undefined) => void
  setColResizeData: SetColResizeData
  setColReorderKey: SetColReorderKey
  onColumnsChange?: (columns: GroupedColumns<T, R>) => void
  onDataChange?: (data: T[]) => void
  onRowStateChange: OnRowStateChange
  onDerivedColumnsChange: (derivedCols: DerivedColsResult<T, R>) => void
  onAreasChanged: (gridAreas: BodyAreaDesc<T, R>[]) => void
  onHeadersChanged: (headerAreas: HeaderAreaDesc<T, R>[]) => void
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
  enableCellSelection?: boolean
  enableColumnResize?: boolean
  enableColumnReorder?: boolean
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
  setStartCell: (cellPosition: CellPosition | undefined) => void
  setSelection: (cellSelection: CellSelection | undefined) => void
  setColResizeData: SetColResizeData
  setColReorderKey: SetColReorderKey
  onColumnsChange?: (columns: GroupedColumns<T, R>) => void
  onDataChange?: (data: T[]) => void
  onRowStateChange: OnRowStateChange

  cellSelectionPlugin?: CellSelectionPlugin<T, R>
  columnResizePlugin?: ColumnResizePlugin<T, R>
  columnReorderPlugin?: ColumnReorderPlugin<T, R>

  // Dynamic props
  $viewportWidth = signal(0)
  $viewportHeight = signal(0)
  $columns = signal<GroupedColumns<T, R>>([])
  $headerRowHeight = signal(0)
  $data = signal<T[]>([])
  $pinnedTopData = signal<T[]>([])
  $pinnedBottomData = signal<T[]>([])
  $rowState = signal<RowState>({})
  $enableCellSelection = signal(false)
  $enableColumnResize = signal(false)
  $enableColumnReorder = signal(false)

  // Derived values
  $derivedData = computed(() => {
    const $comparators = computed(() =>
      flatMapColumns(
        this.$columns(),
        c => c as Column<T, R>,
        c => Boolean(!isColumnGroup(c) && c.sortable && c.sortDirection)
      )
        .sort((a, b) => (a.sortPriority ?? 0) - (b.sortPriority ?? 0))
        .map(c => {
          if (c.createSortComparator) {
            return c.createSortComparator(c.sortDirection!)
          }

          return createDefaultSortComparator(c.getValue, c.sortDirection!)
        })
    )

    // Sort data
    if (!$comparators().length) {
      return this.$data()
    }

    return this.$data().slice().sort(createMultiSort($comparators()))
  })

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

  $headerAreas = computed<HeaderAreaDesc<T, R>[]>(() => {
    const derivedCols = this.$derivedCols()
    const headerRowHeight = this.$headerRowHeight()
    const headerHeight = this.$headerHeight()
    // In render order
    return [
      {
        id: AreaPos.Middle,
        columns: this.$middleHeaderCols(),
        colAreaPos: AreaPos.Middle,
        headerRowHeight,
        left: derivedCols.start.size,
        width: derivedCols.middle.size + derivedCols.end.size,
        height: headerHeight,
      },
      {
        id: AreaPos.End,
        columns: derivedCols.end.itemsWithGrouping,
        colAreaPos: AreaPos.End,
        headerRowHeight,
        left: this.$viewportWidth() - this.$scrollbarWidth() - derivedCols.end.size,
        width: derivedCols.end.size,
        height: headerHeight,
      },
      {
        id: AreaPos.Start,
        columns: derivedCols.start.itemsWithGrouping,
        colAreaPos: AreaPos.Start,
        headerRowHeight,
        left: 0,
        width: derivedCols.start.size,
        height: headerHeight,
      },
    ]
  })

  // -- Grid areas (pushed in render order)
  $areas = computed(() => {
    const byRender: BodyAreaDesc<T, R>[] = []
    const byCol: BodyAreaDesc<T, R>[][] = []

    const addToCol = (colIndex: number, rowIndex: number, area: BodyAreaDesc<T, R>) => {
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
        const area: BodyAreaDesc<T, R> = {
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
        const area: BodyAreaDesc<T, R> = {
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
        const area: BodyAreaDesc<T, R> = {
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
        const area: BodyAreaDesc<T, R> = {
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
        const area: BodyAreaDesc<T, R> = {
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
        const area: BodyAreaDesc<T, R> = {
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
        const area: BodyAreaDesc<T, R> = {
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
        const area: BodyAreaDesc<T, R> = {
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
        const area: BodyAreaDesc<T, R> = {
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

  constructor(props: GridManagerStaticProps<T, R>) {
    this.getRowId = props.getRowId
    this.getRowMeta = props.getRowMeta
    this.getRowDetailsMeta = props.getRowDetailsMeta
    this.renderRowDetails = props.renderRowDetails
    this.onColumnsChange = props.onColumnsChange
    this.onDataChange = props.onDataChange
    this.onRowStateChange = props.onRowStateChange

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
      console.log('GridManager unmount')
      this.sizeObserver?.disconnect()
      this.onResize.cancel()
      this.cellSelectionPlugin?.unmount()
      this.columnResizePlugin?.unmount()
      this.columnReorderPlugin?.unmount()
      this.mounted = false
    }
  }

  update(props: GridManagerDynamicProps<T, R>) {
    this.$columns.set(props.columns)
    this.$headerRowHeight.set(props.headerRowHeight)
    this.$data.set(props.data)
    this.$pinnedTopData.set(props.pinnedTopData)
    this.$pinnedBottomData.set(props.pinnedBottomData)
    this.$rowState.set(props.rowState)
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

  changeSort(column: DerivedColumn<T, R>) {
    if (!this.onColumnsChange) {
      console.error('onColumnsChange prop is required to enable column sorting')
      return
    }

    const nextSortDirection = getNextSortDirection(column.sortDirection)

    // Update columns, we derived sorting columns and sort the data once
    // we receive new $columns
    const nextColumns = updateColumn(this.$columns(), {
      ...column,
      sortDirection: nextSortDirection,
      sortPriority: Date.now(),
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

export function createGridManager<T, R>(props: GridManagerStaticProps<T, R>) {
  return root(() => new GridManager(props))
}
