import { expect, test } from 'jest'
import { deriveColumns } from './deriveColumns'

test('deriveColumns', () => {
  const noop = () => {
    /**/
  }
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

  expect(res).toEqual({
    start: {
      cols: [
        {
          key: 'e',
          width: 10,
          pin: 'start',
          offset: 0,
          rowIndex: 0,
          rowSpan: 2,
          colIndex: 0,
          getValue: noop,
        },
        {
          key: 'f',
          pin: 'start',
          width: 640,
          offset: 10,
          rowIndex: 0,
          rowSpan: 2,
          colIndex: 1,
          getValue: noop,
        },
      ],
      items: [
        {
          key: 'e',
          width: 10,
          pin: 'start',
          offset: 0,
          rowIndex: 0,
          rowSpan: 2,
          colIndex: 0,
          getValue: noop,
        },
        {
          key: 'f',
          pin: 'start',
          width: 640,
          offset: 10,
          rowIndex: 0,
          rowSpan: 2,
          colIndex: 1,
          getValue: noop,
        },
      ],
      size: 650,
    },
    middle: {
      cols: [
        {
          key: 'a',
          width: 20,
          offset: 0,
          rowIndex: 0,
          rowSpan: 2,
          colIndex: 2,
          getValue: noop,
        },
      ],
      items: [
        {
          key: 'a',
          width: 20,
          offset: 0,
          rowIndex: 0,
          rowSpan: 2,
          colIndex: 2,
          getValue: noop,
        },
      ],
      size: 20,
    },
    end: {
      cols: [
        {
          key: 'b',
          pin: 'end',
          children: [
            {
              key: 'c',
              width: 10,
              offset: 0,
              rowIndex: 1,
              rowSpan: 1,
              colIndex: 3,
              getValue: noop,
            },
            {
              key: 'd',
              width: 320,
              offset: 10,
              rowIndex: 1,
              rowSpan: 1,
              colIndex: 4,
              getValue: noop,
            },
          ],
          width: 330,
          offset: 0,
          rowIndex: 0,
          rowSpan: 1,
          colIndex: 3,
        },
      ],
      items: [
        {
          key: 'c',
          width: 10,
          offset: 0,
          rowIndex: 1,
          rowSpan: 1,
          colIndex: 3,
          getValue: noop,
        },
        {
          key: 'd',
          width: 320,
          offset: 10,
          rowIndex: 1,
          rowSpan: 1,
          colIndex: 4,
          getValue: noop,
        },
      ],
      size: 330,
    },
    size: 1000,
    headerRows: 2,
  })
})
