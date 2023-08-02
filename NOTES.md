## Todo

### Docs

- Can we consume TS Props in docs?
- Add JSDocs to types
- Legal page

### Post MVP

- Row resizing
- Pasting tabular data into multiple selected cells
- Allow user to programmatically scroll to a row/col
- Cell editing (a cell renderer provided by us)
- Column filtering (a header renderer provided by us)
- Row re-ordering
- SolidJS support
- Find a good TS throttle
- Safely limit row/col window range?
- Sorting group column (https://www.ag-grid.com/javascript-data-grid/row-sorting/#custom-sorting-groups-example)
- When sorting col at edge auto scroll

## Bugs

- Clicking in row details selects closest parent cell. Don't change selection on item details clicks.
- Only highlight column @ col reorder when pointermove happens
