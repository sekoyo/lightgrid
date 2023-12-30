import { expect, test } from '@jest/globals'
import { deriveColumns } from '../deriveColumns'
import { AreaPos, DerivedColsResult } from '../../types'

test('deriveColumns', () => {
  const noop = () => {}
  const res = deriveColumns(
    [
      {
        key: 'a',
        width: 20,
        getValue: noop,
      },
      {
        key: 'b',
        pin: 'end',
        children: [
          {
            key: 'c',
            width: 10,
            getValue: noop,
          },
          {
            key: 'd',
            width: '0.5fr',
            getValue: noop,
          },
          {
            key: 'e',
            width: '10px',
            getValue: noop,
            pin: 'start',
          },
        ],
      },
      {
        key: 'f',
        pin: 'start',
        width: '1fr',
        getValue: noop,
      },
    ],
    1000
  )

  const expectedRes: DerivedColsResult<any, any> = {
    start: {
      areaPos: AreaPos.Start,
      itemsWithGrouping: [
        {
          key: 'e',
          size: 10,
          pin: 'start',
          offset: 0,
          rowIndex: 0,
          headerColSpan: 1,
          headerRowSpan: 2,
          colIndex: 0,
          getValue: noop,
        },
        {
          key: 'f',
          pin: 'start',
          size: 640,
          offset: 10,
          rowIndex: 0,
          headerColSpan: 1,
          headerRowSpan: 2,
          colIndex: 1,
          getValue: noop,
        },
      ],
      items: [
        {
          key: 'e',
          size: 10,
          pin: 'start',
          offset: 0,
          rowIndex: 0,
          headerColSpan: 1,
          headerRowSpan: 2,
          colIndex: 0,
          getValue: noop,
        },
        {
          key: 'f',
          pin: 'start',
          size: 640,
          offset: 10,
          rowIndex: 0,
          headerColSpan: 1,
          headerRowSpan: 2,
          colIndex: 1,
          getValue: noop,
        },
      ],
      topLevelByIndex: [],
      size: 650,
      startOffset: 0,
      startIndexOffset: 0,
      firstWithSize: true,
    },
    middle: {
      areaPos: AreaPos.Middle,
      itemsWithGrouping: [
        {
          key: 'a',
          size: 20,
          offset: 0,
          rowIndex: 0,
          headerColSpan: 1,
          headerRowSpan: 2,
          colIndex: 2,
          getValue: noop,
        },
      ],
      items: [
        {
          key: 'a',
          size: 20,
          offset: 0,
          rowIndex: 0,
          headerColSpan: 1,
          headerRowSpan: 2,
          colIndex: 2,
          getValue: noop,
        },
      ],
      topLevelByIndex: [],
      size: 20,
      startOffset: 650,
      startIndexOffset: 2,
      firstWithSize: false,
    },
    end: {
      areaPos: AreaPos.End,
      itemsWithGrouping: [
        {
          key: 'b',
          pin: 'end',
          children: [
            {
              key: 'c',
              size: 10,
              offset: 0,
              rowIndex: 1,
              headerColSpan: 1,
              headerRowSpan: 1,
              colIndex: 3,
              getValue: noop,
            },
            {
              key: 'd',
              size: 320,
              offset: 10,
              rowIndex: 1,
              headerColSpan: 1,
              headerRowSpan: 1,
              colIndex: 4,
              getValue: noop,
            },
          ],
          size: 330,
          offset: 0,
          rowIndex: 0,
          headerColSpan: 2,
          headerRowSpan: 1,
          colIndex: 3,
        },
      ],
      items: [
        {
          key: 'c',
          size: 10,
          offset: 0,
          rowIndex: 1,
          headerColSpan: 1,
          headerRowSpan: 1,
          colIndex: 3,
          getValue: noop,
        },
        {
          key: 'd',
          size: 320,
          offset: 10,
          rowIndex: 1,
          headerColSpan: 1,
          headerRowSpan: 1,
          colIndex: 4,
          getValue: noop,
        },
      ],
      topLevelByIndex: [],
      size: 330,
      startOffset: 670,
      startIndexOffset: 3,
      firstWithSize: false,
    },
    size: 1000,
    itemCount: 6,
    headerRowCount: 2,
    hasFilters: false,
  }

  expect(res).toEqual(expectedRes)
})
