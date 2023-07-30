import type { ColumnOrGroup, GroupedColumns, ItemId } from '../types'
import { isColumnGroup } from './isTypes'

export function flatMapColumns<T, R, O>(
  columns: GroupedColumns<T, R>,
  mapFn: (c: ColumnOrGroup<T, R>) => O,
  filterFn: (c: ColumnOrGroup<T, R>) => boolean = () => true
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

// Minimizes new objects and early exits
export function updateColumn<T, R>(
  topLvlCols: GroupedColumns<T, R>,
  newColumn: ColumnOrGroup<T, R>
) {
  function update(columns: GroupedColumns<T, R>) {
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

export function findColumn<T, R>(
  columns: GroupedColumns<T, R>,
  columnKey: ItemId
): ColumnOrGroup<T, R> | undefined {
  for (const c of columns) {
    if (c.key === columnKey) return c

    if (isColumnGroup(c)) {
      const foundCol = findColumn(c.children, columnKey)
      if (foundCol) return foundCol
    }
  }
}
