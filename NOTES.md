## Todo

- Column sorting
- Safely limit row/col window range

### Docs

- Checkout nice CodeSandbox embed - https://leptos-rs.github.io/leptos/view/02_dynamic_attributes.html
- Can we consume TS Props in docs?
- Getting started docs
- Column docs
- Make docs/ as markdown and use Codesandbox etc embeded examples?
- Theming (create theme builder UI too)
- Master-details example
- Tree data example

### Post MVP

- Row resizing
- Pasting tabular data into multiple selected cells
- Throw on non-unique key in deriveCols/Rows if NODE_ENV !== 'production'
- Allow user to programmatically scroll to a row/col
- Async example & grid overlay prop - allows you to place a loading view etc over grid
- Global filtering (searching) example
- Cell editing (a cell renderer provided by us)
- Column filtering (a header renderer provided by us)
- Row re-ordering
- SolidJS support
- Find a good TS throttle
- Clicking column header highlights cells in column

## Bugs

- Clicking in row details selects closest parent cell. Don't change selection on item details clicks.
