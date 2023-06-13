- Fix layout shift caused by scrollbars (it seems) not present in react-grid. Rewind history and check.
- Remove DerivedRowsResult? Because they are derived sep, we could split areas up too as they are re-derived if _any_ row results change
- Try debounce instead of throttle to prevent multiple renders initially

## Later

- Merge header and body areas?
- Ability to pass plugins into GridManager
