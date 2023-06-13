- Remove DerivedRowsResult? Because they are derived sep, we could split areas up too as they are re-derived if _any_ row results change
- Try debounce instead of throttle to prevent multiple renders initially

## Later

- Merge header and body areas?
- Ability to pass plugins into GridManager
