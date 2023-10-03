import { GroupedColumns } from '../types'
import { isColumnGroup } from './isTypes'

export function getHeaderHeight<T, N>(
  columns: GroupedColumns<T, N>,
  headerRowHeight: number,
  filterRowHeight: number
) {
  let totalDepth = 1
  let filterHeight = 0

  function recurse(levelColumns: GroupedColumns<T, N>, depth = 1) {
    if (totalDepth < depth) {
      totalDepth = depth
    }

    for (let i = 0; i < levelColumns.length; i++) {
      const column = levelColumns[i]

      if (isColumnGroup(column)) {
        recurse(column.children, depth + 1)
      } else if (column.filterComponent) {
        filterHeight = filterRowHeight
      }
    }
  }

  recurse(columns)

  return totalDepth * headerRowHeight + filterHeight
}
