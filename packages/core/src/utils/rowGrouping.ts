import { RowState } from '../types'
import { isShallowObjEq } from './isShallowObjEq'

type GroupDesc<T extends object> = {
  key: string
  getValue: (item: T) => string | number
}

export interface GroupRow {
  isGroup: boolean
  id: string
  groupKey: string
  value: string
  childCount: number
  descendantCount: number
  depth: number
}

export function isRowGroup<T>(row: GroupRow | T): row is GroupRow {
  return (row as GroupRow).isGroup
}

const makeRowId = (parentId: string, id: string) =>
  parentId ? `${parentId}>${id}` : id

type RecursiveGroup<T> = { [key: string]: RecursiveGroup<T> | T[] }

function _groupBy<T extends object>(
  data: T[],
  groupDescs: GroupDesc<T>[]
): [RecursiveGroup<T>, Map<string, number>] {
  const descCount = new Map<string, number>()
  const grouped = data.reduce((groups, item) => {
    const descRowIds: string[] = []
    let parentId = ''

    groupDescs
      .reduce((currGroup, groupDesc, i, { length }) => {
        const groupValue = String(groupDesc.getValue(item))

        const groupRowId = (parentId = makeRowId(parentId, groupValue))
        descRowIds.push(groupRowId)

        if (currGroup[groupValue]) {
          return currGroup[groupValue]
        }

        if (i === length - 1) {
          // The final grouping contains an array
          // to put the matched item inside.
          currGroup[groupValue] = []
        } else {
          // Non-final groupings contain an object
          // with more groupings inside.
          currGroup[groupValue] = {}
        }

        return currGroup[groupValue]
      }, groups)
      .push(item)

    // For each group we encountered while putting
    // the item in place, increment its descendant
    // count by 1.
    descRowIds.forEach(rowKey => {
      const count = descCount.get(rowKey) ?? 0
      descCount.set(rowKey, count + 1)
    })

    return groups
  }, {} as any)

  return [grouped, descCount]
}

// Quick 'n' dirty memo
let lastData: any
let lastGroupDesc: any[]
let lastRes: [RecursiveGroup<any>, Map<string, number>]
function groupBy<T extends object>(
  data: T[],
  groupDescs: GroupDesc<T>[]
): [RecursiveGroup<T>, Map<string, number>] {
  if (data !== lastData || !isShallowObjEq(groupDescs, lastGroupDesc)) {
    lastRes = _groupBy(data, groupDescs)
  }
  lastData = data
  lastGroupDesc = groupDescs
  return lastRes
}

export function groupData<T extends object>(
  data: T[],
  groups: Array<keyof T | GroupDesc<T>>,
  rowState: RowState<any>,
  defaultExpandTo = 0
) {
  const normalizedGroups = groups.map(g => {
    if (typeof g === 'string') {
      return {
        key: g,
        getValue: item => item[g],
      } as GroupDesc<T>
    }
    return g as GroupDesc<T>
  })
  const [groupedData, descCount] = groupBy(data, normalizedGroups)
  const groupedRows: Array<T | GroupRow> = []

  function recurse(
    level: RecursiveGroup<T> | T[],
    depth: number,
    parentId: string
  ) {
    if (Array.isArray(level)) {
      groupedRows.push(...level)
    } else {
      Object.keys(level).forEach(groupValue => {
        const rowKey = makeRowId(parentId, groupValue)
        const children = level[groupValue]
        const childIsArr = Array.isArray(children)
        const childCount = childIsArr
          ? children.length
          : Object.keys(children).length

        const groupRow: GroupRow = {
          isGroup: true,
          id: rowKey,
          groupKey: normalizedGroups[depth].key,
          value: groupValue,
          childCount,
          descendantCount: descCount.get(rowKey) ?? 0,
          depth,
        }

        groupedRows.push(groupRow)

        const rs = rowState[rowKey]

        if (
          rs?.expanded ||
          (rs?.expanded === undefined &&
            (defaultExpandTo === -1 || defaultExpandTo > depth))
        ) {
          recurse(children, depth + 1, groupRow.id)
        }
      })
    }
  }

  recurse(groupedData, 0, '')
  return groupedRows
}
