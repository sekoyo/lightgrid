## Todo

https://github.com/jdorfman/awesome-json-datasets
https://catalog.data.gov/dataset/?res_format=JSON
https://www.kaggle.com/datasets

Good for master-details (prizes in details)
https://api.nobelprize.org/v1/laureate.json

- Add colspan/rowspan to column definition docs
- Style improvements
- Lazily load iframe demos based on visibility?
- Iframe loading spinner
- Fullscreen option for demos/source code
- Scroll to row / col + docs
- Add bookmark # to H1,H2 etc
- SolidJS support
- Home page
- Pricing page
- Legal page
- // TODO: Change to 404 return <IntroDoc />

### Post MVP

- Check reorder scrolls
- Paste CSV/XLS into grid
- Include instructions to use from CDN
- Row resizing
- Move col sort icon to abs and put in padding area
- Allow user to programmatically scroll to a row/col
- Example with loading placeholders in cells
- Make (e) enterprise clickable with some info, maybe in a modal
- Cell editing (a cell renderer provided by us)
- Row re-ordering with drag'n'drop
- Safely limit row/col window range?
- When sorting col at edge auto scroll
- Write medium articles under Lightfin and link to Datagrid. e.g. one about Solid
- Context menu plugin
- Automate doc page navigation buttons (prev/next)
- More user friendly version of `GroupedColumns<Animal, React.ReactNode>` for each framework?
  Have it as an option to import `<T, N>` ones from framework package without the N?
- Add expand/collapse to header of expand cols
- Consider how left/right/tab could edit adjacent cells

## Bugs

- Clicking in row details selects closest parent cell. Don't change selection on item details clicks.
- At certain widths, calced with is underlapping. Particularly noticeable with header on light theme.
- Extra col divider on right visible on http://localhost:8093/docs/guides/theming

# Do and Donts

- Use fn version of useState for columns: useState(() => {})
- Wrap columns in hook in functional component
