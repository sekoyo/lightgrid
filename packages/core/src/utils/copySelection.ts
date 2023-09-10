import {
  ValueSource,
  type CellSelection,
  type DerivedColResult,
  type DerivedColsResult,
  type DerivedRowResult,
  type DerivedRowsResult,
} from '../types'

const quotes = new RegExp('"', 'g')

function toSafeCsvValue(v: any) {
  const value = String(v).replace(quotes, '""')
  return `"${value}"`
}

function rowValuesToCSV(rowValues: string[][]) {
  return rowValues
    .filter(Boolean)
    .map(row => row.map(toSafeCsvValue).join(','))
    .join('\n')
}

function getCellValues<T, N>(
  selection: CellSelection,
  colResult: DerivedColResult<T, N>,
  rowResult: DerivedRowResult<T>,
  csvRows: string[][]
) {
  const c1 = Math.min(
    selection.colRange[1],
    colResult.startIndexOffset + (colResult.items.length - 1)
  )
  const c2 = Math.max(selection.colRange[0], colResult.startIndexOffset)

  const r1 = Math.min(
    selection.rowRange[1],
    rowResult.startIndexOffset + (rowResult.items.length - 1)
  )
  const r2 = Math.max(selection.rowRange[0], rowResult.startIndexOffset)

  const colOverlap = c1 >= c2
  const rowOverlap = r1 >= r2

  if (colOverlap && rowOverlap) {
    const colStartIdx =
      Math.max(colResult.startIndexOffset, selection.colRange[0]) -
      colResult.startIndexOffset
    const colEndIdx =
      Math.min(
        selection.colRange[1],
        colResult.startIndexOffset + colResult.items.length - 1
      ) - colResult.startIndexOffset

    const rowStartIdx =
      Math.max(rowResult.startIndexOffset, selection.rowRange[0]) -
      rowResult.startIndexOffset
    const rowEndIdx =
      Math.min(
        selection.rowRange[1],
        rowResult.startIndexOffset + rowResult.items.length - 1
      ) - rowResult.startIndexOffset

    for (let r = rowStartIdx; r <= rowEndIdx; r++) {
      const row = rowResult.items[r]
      if (!csvRows[row.rowIndex]) {
        csvRows[row.rowIndex] = []
      }
      for (let c = colStartIdx; c <= colEndIdx; c++) {
        const column = colResult.items[c]
        const value = column.getValue(row.item, ValueSource.Clipboard)
        csvRows[row.rowIndex].push(value)
      }
    }
  }
}

export async function copySelection<T, N>(
  selection: CellSelection,
  derivedCols: DerivedColsResult<T, N>,
  derivedRows: DerivedRowsResult<T>
) {
  const values: string[][] = []

  if (derivedRows.start.size) {
    getCellValues<T, N>(selection, derivedCols.start, derivedRows.start, values)
    getCellValues<T, N>(selection, derivedCols.middle, derivedRows.start, values)
    getCellValues<T, N>(selection, derivedCols.end, derivedRows.start, values)
  }

  if (derivedRows.middle.size) {
    getCellValues<T, N>(selection, derivedCols.start, derivedRows.middle, values)
    getCellValues<T, N>(selection, derivedCols.middle, derivedRows.middle, values)
    getCellValues<T, N>(selection, derivedCols.end, derivedRows.middle, values)
  }

  if (derivedRows.end.size) {
    getCellValues<T, N>(selection, derivedCols.start, derivedRows.end, values)
    getCellValues<T, N>(selection, derivedCols.middle, derivedRows.end, values)
    getCellValues<T, N>(selection, derivedCols.end, derivedRows.end, values)
  }

  const csvStr = rowValuesToCSV(values) + '\n'
  await navigator.clipboard.writeText(csvStr)
}
