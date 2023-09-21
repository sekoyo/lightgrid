import type { Column, ColumnOrGroup, GroupedColumns, ItemId } from '../types'
import { isColumnGroup } from './isTypes'

export function flatMapColumns<T, N, O>(
  columns: GroupedColumns<T, N>,
  mapFn: (c: ColumnOrGroup<T, N>) => O,
  filterFn: (c: ColumnOrGroup<T, N>) => boolean = () => true
): O[] {
  return columns.reduce((mappedColumns, c) => {
    if (filterFn(c)) {
      mappedColumns.push(mapFn(c))
    }
    if (isColumnGroup(c)) {
      mappedColumns.push(...flatMapColumns(c.children, mapFn, filterFn))
    }
    return mappedColumns
  }, [] as O[])
}

// Minimizes new objects and exits early
export function updateColumn<T, N>(
  topLvlCols: GroupedColumns<T, N>,
  newColumn: ColumnOrGroup<T, N>
) {
  function update(columns: GroupedColumns<T, N>) {
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i]
      if (column.key === newColumn.key) {
        columns.splice(i, 1, newColumn)
        break
      } else if (isColumnGroup(column)) {
        const columnCopy = Object.assign({}, column)
        columnCopy.children = update(column.children.slice())
        columns.splice(i, 1, columnCopy)
      }
    }

    return columns
  }

  return update(topLvlCols.slice())
}

export function mapColumns<T, N>(
  topLvlCols: GroupedColumns<T, N>,
  mapFn: (c: ColumnOrGroup<T, N>) => ColumnOrGroup<T, N>
) {
  function update(columns: GroupedColumns<T, N>) {
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i]
      const nextColumn = mapFn(columns[i])

      if (column !== nextColumn) {
        columns.splice(i, 1, nextColumn)
      }

      if (isColumnGroup(column)) {
        const columnCopy = Object.assign({}, column)
        columnCopy.children = update(column.children.slice())
        columns.splice(i, 1, columnCopy)
      }
    }

    return columns
  }

  return update(topLvlCols.slice())
}

export function findColumnOrGroupByKey<T, N>(
  columns: GroupedColumns<T, N>,
  columnKey: ItemId
): ColumnOrGroup<T, N> | undefined {
  for (const c of columns) {
    if (c.key === columnKey) return c

    if (isColumnGroup(c)) {
      const foundCol = findColumnOrGroupByKey(c.children, columnKey)
      if (foundCol) return foundCol
    }
  }
}

export function findColumn<T, N>(
  columns: GroupedColumns<T, N>,
  testFn: (c: Column<T, N>) => boolean
): Column<T, N> | undefined {
  for (const c of columns) {
    if (!isColumnGroup(c)) {
      if (testFn(c)) return c
    } else {
      const foundCol = findColumn(c.children, testFn)
      if (foundCol) return foundCol
    }
  }
}
