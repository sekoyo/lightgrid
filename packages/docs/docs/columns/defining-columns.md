---
sidebar_position: 1
---

# Defining Columns

The only required props are `key` and `getValue`.

<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        key <em>(required)</em>
      </td>
      <td>`string | number`</td>
      <td>A unique key for this column. Do not use an array index</td>
    </tr>
    <tr>
      <td>
        getValue <em>(required)</em>
      </td>
      <td>`(row: T, source: ValueSource) => any`</td>
      <td>
        Should return the value for the cell. You can return different values depending on the `source` param. For example you might want to return a formatted number when the source is `ValueSource.Cell`, and an unformatted one when `ValueSource.Clipboard` or `ValueSource.Sort`
      </td>
    </tr>
    <tr>
      <td>header</td>
      <td>
        Node
      </td>
      <td>The header text or node for this column</td>
    </tr>
    <tr>
      <td>width</td>
      <td>`string` e.g. "100px" or "0.5fr", or `number` in pixels</td>
      <td>
        The column width. Can be `"10px"` or `10` (pixels), or `"0.5fr"` (fractional unit). Defaults to `"1fr"`
      </td>
    </tr>
    <tr>
      <td>minWidth</td>
      <td>`number` in pixels</td>
      <td>
        The minimum width this column can be, in pixels. Defaults to `100`
      </td>
    </tr>
    <tr>
      <td>sortable</td>
      <td>`boolean`</td>
      <td>
        Whether this column can be sorted or not. You must implement the `onColumnsChange` prop for sorting to work
      </td>
    </tr>
    <tr>
      <td>sortDirection</td>
      <td>`enum SortDirection`</td>
      <td>
        The current sort direction of this column (or undefined for no sort)
      </td>
    </tr>
    <tr>
      <td>createSortComparator</td>
      <td>`(sortDirection: SortDirection) => Comparator<T>`</td>
      <td>
        Given the sort direction, returns a custom comparator function. If not defined then the default comparator is used
      </td>
    </tr>
    <tr>
      <td>sortPriority</td>
      <td>`number`</td>
      <td>
        The sort priority when multiple columns are sorted. Lower is higher priority. By default it's based on the order that columns are clicked
      </td>
    </tr>
    <tr>
      <td>pin</td>
      <td>`ColumnPin`</td>
      <td>
        Pin this column to the left (`"start"`) or right (`"end"`) if you wish it to always be visible even if the user scrolls
      </td>
    </tr>
    <tr>
      <td>cellComponent</td>
      <td>`(props: CellComponentProps<T, S>) => Node`</td>
      <td>
        A function given a the current column, row item, and optionally row state & setter, returns the cell node to be rendered. If not specified will render the result of `column.getValue(item, ValueSource.Cell)`
      </td>
    </tr>
    <tr>
      <td>colSpan</td>
      <td>`(item: T) => number`</td>
      <td>
        Return a number greater than 1 to make a cell in this column span into adjacent columns. Return -1 to span all remaining columns in the grid area
      </td>
    </tr>
    <tr>
      <td>rowSpan</td>
      <td>`(item: T) => number`</td>
      <td>
        Return a number greater than 1 to make a cell in this column span into adjacent rows. Return -1 to span all remaining rows in the grid area
      </td>
    </tr>
  </tbody>
</table>

## Grouping

`columns` can be a nested array, where a grouping column has `children: []`. See [Column Grouping](./grouping)

## Examples

```tsx
import { GroupedColumns, ValueSource } from '@lightgrid/react'

interface CryptoCurrency {
  rank: number,
  name: string,
  symbol: string,
  marketCap: string,
  lastPrice: number,
  volume24h: number,
  priceChange1h: number,
  priceChange7h: number,
  priceChange24h: number,
  priceChange7d: number,
}

const columns = GroupedColumns<CryptoCurrency> = [
  {
    key: 'rank',
    header: <em>Rank</em>.
    getValue: d => d.rank,
    width: 90,
  },
  {
    key: 'symbol',
    header: 'Symbol',
    getValue: d => d.symbol,
    cellComponent: ({ column, item }) => <CryptoSymbol symbol={d.symbol} />
  },
  {
    key: 'marketCap',
    getValue: (d, source) => source === ValueSource.Cell ?
      formatCCY(d.marketCap, 'USD') : d.marketCap,
  },
  {
    key: 'lastPrice',
    getValue: (d, source) => source === ValueSource.Cell ?
      formatCCY(d.lastPrice, d.symbol) : d.lastPrice,
  },
  {
    key: 'priceChange24h',
    header: '% 24h',
    getValue: (d, source) => source === ValueSource.Cell ?
      `${priceChange24h}%` : d.priceChange24h,
  }
]
```

### Example of grouped columns

```tsx
const columns = (GroupedColumns<CryptoCurrency> = [
  {
    key: 'priceChangeGroup',
    header: 'Price change',
    children: [
      {
        key: 'priceChange1h',
        header: '% 1h',
        getValue: (d, source) =>
          source === ValueSource.Cell ? `${priceChange1h}%` : d.priceChange1h,
      },
      {
        key: 'priceChange7h',
        header: '% 7h',
        getValue: (d, source) =>
          source === ValueSource.Cell ? `${priceChange7h}%` : d.priceChange7h,
      },
      {
        key: 'priceChange24h',
        header: '% 24h',
        getValue: (d, source) =>
          source === ValueSource.Cell ? `${priceChange24h}%` : d.priceChange24h,
      },
      {
        key: 'priceChange7d',
        header: '% 7d',
        getValue: (d, source) =>
          source === ValueSource.Cell ? `${priceChange7d}%` : d.priceChange7d,
      },
    ],
  },
])
```
