import { expect, test } from '@jest/globals'
import { flatMapColumns } from '../columnFns'
import { GroupedColumns, ItemId, SortDirection } from '../../types'

interface Item {
  id: ItemId
}

const getValue = (item: Item) => {
  return item.id
}

test('flatMapColumns', () => {
  const columns: GroupedColumns<Item, any> = [
    {
      key: 'b',
      header: 'B',
      pin: 'end',
      children: [
        {
          key: 'c',
          header: 'C',
          width: 80,
          getValue,
          sortDirection: SortDirection.Asc,
        },
        {
          key: 'd',
          header: 'D',
          children: [
            {
              key: 'x',
              header: 'X',
              width: '0.5fr',
              getValue,
              sortDirection: SortDirection.Desc,
            },
            {
              key: 'y',
              header: 'Y',
              width: '0.5fr',
              getValue,
            },
          ],
        },
        {
          key: 'e',
          header: 'E',
          width: '120px',
          getValue,
          pin: 'start',
          sortable: true,
          sortDirection: undefined,
        },
      ],
    },
  ]

  expect(flatMapColumns(columns, c => c.key)).toEqual(['b', 'c', 'd', 'x', 'y', 'e'])

  expect(
    flatMapColumns(
      columns,
      c => c.key,
      c => c.key !== 'd'
    )
  ).toEqual(['b', 'c', 'x', 'y', 'e'])
})
