import {
  type ColumnPin,
  type GroupedColumns,
  type DerivedColumn,
  type DerivedGroupColumns,
  type DerivedColsResult,
  type DerivedColResult,
  AreaPos,
} from '../types'
import { isColumnGroup } from './isTypes'

const defaultFr = 1
const defaultAbs = 100
// We don't actually validate if the user pass in < minWidth only that
// when calculating fractional widths there is a min, and when column resizing
const defaultFrMinWidth = 100

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
          totalFractions += parseFloat(width) ?? defaultFr
        } else {
          totalAbsolutes += parseFloat(width) ?? defaultAbs
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
  minWidth = defaultFrMinWidth
) {
  const width = maybeWidth ?? '1fr'

  if (typeof width === 'number') {
    return width
  } else if (width.endsWith('fr')) {
    const n = parseFloat(width)
    return Math.max(
      minWidth,
      Math.floor(((n ?? defaultFr) / totalFractions) * (viewportWidth - totalAbsolutes))
    )
  } else {
    return parseFloat(width) || defaultAbs
  }
}

const createEmptyColResults: <T, R>() => DerivedColsResult<T, R> = () => ({
  start: {
    areaPos: AreaPos.Start,
    itemsWithGrouping: [],
    items: [],
    size: 0,
    startOffset: 0,
    startIndexOffset: 0,
    firstWithSize: false,
  },
  middle: {
    areaPos: AreaPos.Middle,
    itemsWithGrouping: [],
    items: [],
    size: 0,
    startOffset: 0,
    startIndexOffset: 0,
    firstWithSize: false,
  },
  end: {
    areaPos: AreaPos.End,
    itemsWithGrouping: [],
    items: [],
    size: 0,
    startOffset: 0,
    startIndexOffset: 0,
    firstWithSize: false,
  },
  size: 0,
  itemCount: 0,
  headerRows: 0,
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
          key: column.key,
          header: column.header,
          pin: column.pin,
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
          key: column.key,
          header: column.header,
          minWidth: column.minWidth,
          getValue: column.getValue,
          sortDirection: column.sortDirection,
          onSort: column.onSort,
          filter: column.filter,
          pin: column.pin,
          cellComponent: column.cellComponent,
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
  o.end.startOffset = viewportWidth - o.end.size

  o.itemCount = o.start.items.length + o.middle.items.length + o.end.items.length
  o.headerRows = s.totalDepth

  return o
}
