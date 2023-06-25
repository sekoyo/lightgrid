## Todo

- Consider how the user can write their own plugins and interfere with the render -
  overlays could be quite easy if we iterate over plugins and map `.render()`. Other
  key parts could be at specific places e.g. in the cell renderer.

  **How would we handle if the plugin wants to change e.g. columns?**
  We could make users pass in a `onColumnsChange` which will be needed anyway and expose
  that in the Grid Manager.

  We could make all plugins the same way - e.g. for CellSelectionPlugin you need to pass it
  in at app level.

- Column resizing
- Column re-ordering
- Row re-ordering
- Column filtering
- Column sorting
- Global filtering (searching)
- Cell editing
- SolidJS support
- Safely limit row/col window range
- Grid overlay prop - allows you to place a loading view etc over grid

### Docs

- Can we consume TS Props in docs?
- Getting started docs
- Column docs
- Make docs/ as markdown and use Codesandbox etc embeded examples?
- Theming (create theme builder UI too)
- Master-details example
- Tree data example

### Post MVP

- Row resizing

## Bugs

- Clicking in row details selects closest parent cell. Don't change selection on item details clicks.

## Later

- Merge header and body areas (and introduce concept of col/row spanning)?
