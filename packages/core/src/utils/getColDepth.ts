import { GroupedColumns } from '../types'
import { isColumnGroup } from './isTypes'

export function getColDepth<T, N>(columns: GroupedColumns<T, N>) {
  let totalDepth = 1

  function recurse(levelColumns: GroupedColumns<T, N>, depth = 1) {
    if (totalDepth < depth) {
      totalDepth = depth
    }

    for (let i = 0; i < levelColumns.length; i++) {
      const column = levelColumns[i]

      if (isColumnGroup(column)) {
        recurse(column.children, depth + 1)
      }
    }
  }

  recurse(columns)
  return totalDepth
}
