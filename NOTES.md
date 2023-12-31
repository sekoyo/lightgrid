## Todo

https://github.com/jdorfman/awesome-json-datasets
https://catalog.data.gov/dataset/?res_format=JSON
https://www.kaggle.com/datasets

- Scroll to row / col + docs
- Add Virtual Rows and Virtual Columns docs (just saying it's always on)
- Make menu mobile VP friendly
- Check on mobile VP

### Post MVP

- Check re-order scrolls during drag on edges
- Paste CSV/XLS into grid
- Include instructions to use from CDN
- Row resizing
- Move col sort icon to abs and put in padding area
- Allow user to programmatically scroll to a row/col
- Example with loading placeholders in cells
- Make (e) enterprise clickable with some info, maybe in a modal
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
- Virtualize itemDetails

## Bugs

- Clicking in row details selects closest parent cell. Don't change selection on item details clicks.

# Do and Donts

- Wrap columns in hook in functional component
- Use fn version of useState for columns: useState(() => {})
