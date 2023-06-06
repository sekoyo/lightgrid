import { ColumnPin, GroupedColumns, DerivedColumn, DerivedGroupColumns } from '../types'
import { isColumnGroup } from './isTypes'

const DEFAULT_FR = 1
const DEFAULT_ABS = 100

function sumAndDivideCols<T, R>(columns: GroupedColumns<T, R>) {
  const leftColumns: GroupedColumns<T, R> = []
  const middleColumns: GroupedColumns<T, R> = []
  const rightColumns: GroupedColumns<T, R> = []
  let totalAbsolutes = 0
  let totalFractions = 0
  let totalDepth = 1

  function recurse(
    levelColumns: GroupedColumns<T, R>,
    levelStartColumns: GroupedColumns<T, R>,
    levelMiddleColumns: GroupedColumns<T, R>,
    levelEndColumns: GroupedColumns<T, R>,
    parentPin?: ColumnPin,
    depth = 1
  ) {
    if (totalDepth < depth) {
      totalDepth = depth
    }

    for (let i = 0; i < levelColumns.length; i++) {
      const column = levelColumns[i]
      const pin = column.pin || parentPin

      if (isColumnGroup(column)) {
        const children: GroupedColumns<T, R> = []
        const columnWithoutChildren = {
          ...column,
          children,
        }

        // Split out cols into groups (start|middle|end)
        if (!pin) {
          levelMiddleColumns.push(columnWithoutChildren)
          recurse(
            column.children,
            levelStartColumns,
            children,
            levelEndColumns,
            pin,
            depth + 1
          )
        } else if (pin === 'start') {
          levelStartColumns.push(columnWithoutChildren)
          recurse(
            column.children,
            children,
            levelMiddleColumns,
            levelEndColumns,
            pin,
            depth + 1
          )
        } else if (pin === 'end') {
          levelEndColumns.push(columnWithoutChildren)
          recurse(
            column.children,
            levelStartColumns,
            levelMiddleColumns,
            children,
            pin,
            depth + 1
          )
        }
      } else {
        // Tally total fractional and absolute widths
        const width = column.width ?? '1fr'
        if (typeof width === 'number') {
          totalAbsolutes += width
        } else if (width.endsWith('fr')) {
          totalFractions += parseFloat(width) ?? DEFAULT_FR
        } else {
          totalAbsolutes += parseFloat(width) ?? DEFAULT_ABS
        }

        // Split out cols into groups (left|middle|right)
        if (!pin) {
          levelMiddleColumns.push(column)
        } else if (pin === 'start') {
          levelStartColumns.push(column)
        } else if (pin === 'end') {
          levelEndColumns.push(column)
        }
      }
    }
  }

  recurse(columns, leftColumns, middleColumns, rightColumns)

  return {
    leftColumns,
    middleColumns,
    rightColumns,
    totalDepth,
    totalAbsolutes,
    totalFractions,
  }
}

function getDerivedWidth(
  viewportWidth: number,
  totalAbsolutes: number,
  totalFractions: number,
  maybeWidth?: number | string,
  minWidth = 100
) {
  const width = maybeWidth ?? '1fr'

  if (typeof width === 'number') {
    return width
  } else if (width.endsWith('fr')) {
    const n = parseFloat(width)
    return Math.max(
      minWidth,
      Math.floor(((n ?? DEFAULT_FR) / totalFractions) * (viewportWidth - totalAbsolutes))
    )
  } else {
    return parseFloat(width) || DEFAULT_ABS
  }
}

export interface DerivedColResult<T, R> {
  itemsWithGrouping: DerivedGroupColumns<T, R>
  items: DerivedColumn<T, R>[]
  size: number
  startOffset: number
  startIndexOffset: number
  firstWithSize: boolean
}

export interface DerivedColsResult<T, R> {
  start: DerivedColResult<T, R>
  middle: DerivedColResult<T, R>
  end: DerivedColResult<T, R>
  size: number
  headerRows: number
  totalItems: number
}

const createEmptyColResults: <T, R>() => DerivedColsResult<T, R> = () => ({
  start: {
    itemsWithGrouping: [],
    items: [],
    size: 0,
    startOffset: 0,
    startIndexOffset: 0,
    firstWithSize: false,
  },
  middle: {
    itemsWithGrouping: [],
    items: [],
    size: 0,
    startOffset: 0,
    startIndexOffset: 0,
    firstWithSize: false,
  },
  end: {
    itemsWithGrouping: [],
    items: [],
    size: 0,
    startOffset: 0,
    startIndexOffset: 0,
    firstWithSize: false,
  },
  size: 0,
  headerRows: 0,
  totalItems: 0,
})

const noColumns = createEmptyColResults<any, any>()

export function deriveColumns<T, R>(
  columns: GroupedColumns<T, R>,
  viewportWidth: number
): DerivedColsResult<T, R> {
  if (viewportWidth === 0) {
    return noColumns
  }

  const s = sumAndDivideCols(columns)
  const o = createEmptyColResults<T, R>()

  function recurseColumns(
    levelColumns: GroupedColumns<T, R>,
    colResult: DerivedColResult<T, R>,
    levelDerivedCols: DerivedGroupColumns<T, R>,
    colIndexOffset = 0,
    rowIndex = 0,
    sectionOffset = { current: 0 }
  ) {
    for (let i = 0; i < levelColumns.length; i++) {
      const column = levelColumns[i]
      if (isColumnGroup(column)) {
        const savedOffset = sectionOffset.current
        const children = recurseColumns(
          column.children,
          colResult,
          [],
          colIndexOffset + i,
          rowIndex + 1,
          sectionOffset
        )
        const size = sectionOffset.current - savedOffset
        levelDerivedCols.push({
          ...column,
          children,
          size,
          offset: savedOffset,
          rowIndex,
          rowSpan: 1,
          colIndex: colIndexOffset + i,
        })
      } else {
        const width = getDerivedWidth(
          viewportWidth,
          s.totalAbsolutes,
          s.totalFractions,
          column.width,
          column.minWidth
        )
        const c: DerivedColumn<T, R> = {
          ...column,
          size: width,
          offset: sectionOffset.current,
          rowIndex,
          rowSpan: s.totalDepth - rowIndex,
          colIndex: colIndexOffset + i,
        }
        levelDerivedCols.push(c)
        colResult.items.push(c)
        o.size += width
        sectionOffset.current += width
        colResult.size += width
      }
    }

    return levelDerivedCols
  }

  recurseColumns(s.leftColumns, o.start, o.start.itemsWithGrouping)

  const startLastIdx = o.start.items.length ? o.start.items.at(-1)!.colIndex + 1 : 0
  recurseColumns(s.middleColumns, o.middle, o.middle.itemsWithGrouping, startLastIdx)

  const middleLastIdx = o.middle.items.length ? o.middle.items.at(-1)!.colIndex + 1 : 0
  recurseColumns(s.rightColumns, o.end, o.end.itemsWithGrouping, middleLastIdx)

  // So we know what column area to render row item details (which span all areas) in
  if (o.start.size) {
    o.start.firstWithSize = true
  } else if (!o.start.size && o.middle.size) {
    o.middle.firstWithSize = true
  } else if (!o.start.size && !o.middle.size) {
    o.end.firstWithSize = true
  }

  // Column index offsets to calc absolute column indexes
  o.middle.startIndexOffset = o.start.items.length
  o.end.startIndexOffset = o.start.items.length + o.middle.items.length

  // Starting offsets for column areas (in pixels)
  o.middle.startOffset = o.start.size
  o.end.startOffset = o.start.size + o.middle.size

  o.totalItems = o.start.items.length + o.middle.items.length + o.end.items.length
  o.headerRows = s.totalDepth

  return o
}
