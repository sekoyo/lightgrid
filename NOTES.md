## Todo

- Make (e) enterprise clickable with some info, maybe in a modal
- Example with loading placeholders in cells
- For expand rows have a expand/collapse all icon in header
- Make style more minimal - use page BG colour on all but alt row bg

### Docs

- col + row span docs
- More user friendly version of `GroupedColumns<Animal, React.ReactNode>` for each framework?
  Have it as an option to import `<T, N>` ones from framework package without the N
- Simpler sort icon
- Legal page
- Lazily load iframe demos based on visibility?
- Iframe loading spinner
- Fullscreen option for demos/source code
- Scroll to position + docs
- Add bookmark # to H1,H2 etc

https://github.com/jdorfman/awesome-json-datasets
https://catalog.data.gov/dataset/?res_format=JSON
https://www.kaggle.com/datasets

Good for master-details (prizes in details)

- https://api.nobelprize.org/v1/laureate.json

### Post MVP

- Check reorder scrolls
- Paste CSV/XLS into grid
- Include instructions to use from CDN
- Row resizing
- Pasting tabular data into multiple selected cells
- Allow user to programmatically scroll to a row/col
- Cell editing (a cell renderer provided by us)
- Column filtering (a header renderer provided by us)
- Row re-ordering
- SolidJS support
- Safely limit row/col window range?
- Sorting group column (https://www.ag-grid.com/javascript-data-grid/row-sorting/#custom-sorting-groups-example)
- When sorting col at edge auto scroll
- Write medium articles under Lightfin and link to Datagrid. e.g. one about Solid
- Context menu
- Automate doc page navigation buttons (prev/next)

## Bugs

- Clicking in row details selects closest parent cell. Don't change selection on item details clicks.
- Only highlight column @ col reorder when pointermove happens
- At certain widths, calced with is underlapping. Particularly noticeable with header on light theme.

# Do and Donts

- Use dn version of useState for columns: useState(() => {})
- Wrap columns in hook in functional component
