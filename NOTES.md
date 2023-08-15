## Todo

### Docs

- Do theming with an object so it's strongly typed and makes upgrading for users much easier
- More user friendly version of `GroupedColumns<Animal, React.ReactNode>` for each framework
- Add copy CodeBlock btn to code component + extract out to own file
- Can we consume TS Props in docs? Perhaps by compiling to JSON?
- Add JSDocs to types
- Legal page
- Lazily load iframe demos based on visibility?

### Post MVP

- Include instructions to use from CDN
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
- Write medium articles under Lightfin and link to Datagrid. e.g. one about Solid

## Bugs

- Clicking in row details selects closest parent cell. Don't change selection on item details clicks.
- Only highlight column @ col reorder when pointermove happens
