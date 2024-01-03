// This is a mess don't look at it. But at least it's 2n
import {
  type ColumnPin,
  type GroupedColumns,
  type DerivedColumn,
  type GroupedDerivedColumns,
  type DerivedColsResult,
  type DerivedColResult,
  type DerivedColumnGroup,
  AreaPos,
} from '../types'
import { isColumnGroup } from './isTypes'
import { toNearestHalf } from './numbers'

const defaultFr = 1
const defaultAbs = 100
const defaultFrMinWidth = 100

function sumAndDivideCols<T, N>(columns: GroupedColumns<T, N>) {
  const leftColumns: GroupedColumns<T, N> = []
  const middleColumns: GroupedColumns<T, N> = []
  const rightColumns: GroupedColumns<T, N> = []
  let totalAbsolutes = 0
  let totalFractions = 0
  let totalDepth = 1
  let minFractionalSize = 0
  let totalColumns = 0

  function recurse(
    levelColumns: GroupedColumns<T, N>,
    levelStartColumns: GroupedColumns<T, N>,
    levelMiddleColumns: GroupedColumns<T, N>,
    levelEndColumns: GroupedColumns<T, N>,
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
        const children: GroupedColumns<T, N> = []
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
        totalColumns += 1

        // Tally total fractional and absolute widths
        const width = column.width ?? '1fr'
        if (typeof width === 'number') {
          totalAbsolutes += width
        } else if (width.endsWith('fr')) {
          totalFractions += parseFloat(width) ?? defaultFr
          minFractionalSize += column.minWidth ?? defaultFrMinWidth
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
    totalColumns,
    leftColumns,
    middleColumns,
    rightColumns,
    totalDepth,
    totalAbsolutes,
    totalFractions,
    minFractionalSize,
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
  let res: number

  if (typeof width === 'number') {
    res = width
  } else if (width.endsWith('fr')) {
    const n = parseFloat(width)
    // Problem: How to handle underflow?
    res = Math.max(
      minWidth,
      ((n ?? defaultFr) / totalFractions) * (viewportWidth - totalAbsolutes)
    )
  } else {
    res = parseFloat(width) || defaultAbs
  }

  return toNearestHalf(res)
}

const createEmptyColResults: <T, N>() => DerivedColsResult<T, N> = () => ({
  start: {
    areaPos: AreaPos.Start,
    itemsWithGrouping: [],
    items: [],
    topLevelByIndex: [],
    size: 0,
    startOffset: 0,
    startIndexOffset: 0,
    firstWithSize: false,
  },
  middle: {
    areaPos: AreaPos.Middle,
    itemsWithGrouping: [],
    items: [],
    topLevelByIndex: [],
    size: 0,
    startOffset: 0,
    startIndexOffset: 0,
    firstWithSize: false,
  },
  end: {
    areaPos: AreaPos.End,
    itemsWithGrouping: [],
    items: [],
    topLevelByIndex: [],
    size: 0,
    startOffset: 0,
    startIndexOffset: 0,
    firstWithSize: false,
  },
  size: 0,
  itemCount: 0,
  headerRowCount: 0,
  hasFilters: false,
})

const noColumns = createEmptyColResults<any, any>()

export function deriveColumns<T, N>(
  columns: GroupedColumns<T, N>,
  viewportWidth: number
): DerivedColsResult<T, N> {
  if (viewportWidth === 0) {
    return noColumns
  }

  const summed = sumAndDivideCols(columns)
  const out = createEmptyColResults<T, N>()

  // If abs doesn't overflow we have to make sure total size doesn't
  // slightly under/overflow due to floating point rounding.
  const willStretchToVP =
    summed.minFractionalSize + summed.totalAbsolutes < viewportWidth
  let frSizeRemaining = willStretchToVP
    ? viewportWidth - summed.totalAbsolutes
    : Infinity

  function recurseColumns(
    levelColumns: GroupedColumns<T, N>,
    colResult: DerivedColResult<T, N>,
    levelDerivedCols: GroupedDerivedColumns<T, N>,
    topLevelByIndex: GroupedDerivedColumns<T, N>,
    startingColOffset: number,
    startingColIndexOffset: number,
    colIndexOffset = startingColIndexOffset,
    rowIndex = 0,
    descendantRef = { offset: 0, lastColIndex: 0 }
  ) {
    for (let i = 0; i < levelColumns.length; i++) {
      const column = levelColumns[i]

      if (isColumnGroup(column)) {
        if (column.children.length) {
          const savedOffset = descendantRef.offset
          const colIndex = colIndexOffset + i
          const children = recurseColumns(
            column.children,
            colResult,
            [],
            topLevelByIndex,
            startingColOffset,
            startingColIndexOffset,
            colIndex,
            rowIndex + 1,
            descendantRef
          )
          // Column group is the size of its children
          const size = descendantRef.offset - savedOffset
          const headerColSpan = descendantRef.lastColIndex - colIndex + 1

          const colGroup: DerivedColumnGroup<T, N> = {
            ...column,
            children,
            size,
            offset: savedOffset,
            rowIndex,
            headerColSpan,
            headerRowSpan: 1,
            colIndex: colIndexOffset + i,
          }

          levelDerivedCols.push(colGroup)

          // Add group by colIndex so it can be looked up for virtual window
          if (rowIndex === 0) {
            topLevelByIndex[colIndex - startingColIndexOffset] = colGroup
          }

          // Increment the column index if the group has more than 1 descendant column
          colIndexOffset += descendantRef.lastColIndex - colIndex
        }
      } else {
        const colIndex = colIndexOffset + i
        const isLastCol = colIndex === summed.totalColumns - 1

        let size = getDerivedWidth(
          viewportWidth,
          summed.totalAbsolutes,
          summed.totalFractions,
          column.width,
          column.minWidth
        )

        if (willStretchToVP) {
          // Ensure that columns don't exceed viewport due to rounding if we are
          // stretching to it.
          if (
            !column.width || // If empty then it's 1fr by default
            (typeof column.width === 'string' && column.width.endsWith('fr'))
          ) {
            size = Math.min(size, frSizeRemaining)
            frSizeRemaining = Math.max(0, frSizeRemaining - size)
          }

          // Expand if last item and we need to stretch to VP but didn't quite make
          // it due to FR rounding. This won't work for pinned columns since the offset
          // will be relative to the pinned area, but doesn't matter as pinned area will
          // be flush with the edge anyway.
          if (
            !column.pin &&
            isLastCol &&
            startingColOffset + descendantRef.offset + size < viewportWidth
          ) {
            size = viewportWidth - (startingColOffset + descendantRef.offset)
          }
        }

        const col: DerivedColumn<T, N> = {
          ...column,
          size,
          offset: descendantRef.offset,
          rowIndex,
          headerColSpan: 1,
          headerRowSpan: summed.totalDepth - rowIndex,
          colIndex,
        }

        if (col.filterComponent) {
          out.hasFilters = true
        }

        // Add non-grouped columns to be looked up the virtual window
        if (rowIndex === 0) {
          topLevelByIndex[colIndex - startingColIndexOffset] = col
        }

        levelDerivedCols.push(col)
        colResult.items.push(col)
        out.size += size
        descendantRef.offset += size
        descendantRef.lastColIndex = colIndex
        colResult.size += size
      }
    }

    return levelDerivedCols
  }

  recurseColumns(
    summed.leftColumns,
    out.start,
    out.start.itemsWithGrouping,
    out.start.topLevelByIndex,
    0,
    0
  )

  const startLastIdx = out.start.items.length
    ? out.start.items.at(-1)!.colIndex + 1
    : 0
  recurseColumns(
    summed.middleColumns,
    out.middle,
    out.middle.itemsWithGrouping,
    out.middle.topLevelByIndex,
    out.start.startOffset + out.start.size,
    startLastIdx
  )

  const middleLastIdx = out.middle.items.length
    ? out.middle.items.at(-1)!.colIndex + 1
    : 0
  recurseColumns(
    summed.rightColumns,
    out.end,
    out.end.itemsWithGrouping,
    out.end.topLevelByIndex,
    out.middle.startOffset + out.middle.size,
    middleLastIdx
  )

  // So we know what column area to render row item details (which span all areas) in
  if (out.start.size) {
    out.start.firstWithSize = true
  } else if (!out.start.size && out.middle.size) {
    out.middle.firstWithSize = true
  } else if (!out.start.size && !out.middle.size) {
    out.end.firstWithSize = true
  }

  // Column index offsets to calc absolute column indexes
  out.middle.startIndexOffset = out.start.items.length
  out.end.startIndexOffset = out.start.items.length + out.middle.items.length

  // Starting offsets for column areas (in pixels)
  out.middle.startOffset = out.start.size
  out.end.startOffset = viewportWidth - out.end.size

  out.itemCount =
    out.start.items.length + out.middle.items.length + out.end.items.length
  out.headerRowCount = summed.totalDepth

  return out
}
