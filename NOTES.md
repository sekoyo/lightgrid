- Auto scroll on edges of areas, direction of which is depending if startCell < endCell. Record starting area as we only scroll if originating from a scrollable area (!pinnedX || !pinnedY) and perhaps also lock the scroll on the side that is false
- Remove DerivedRowsResult? Because they are derived sep, we could split areas up too as they are re-derived if _any_ row results change

## Later

- Merge header and body areas (and introduce concept of col/row spanning)?
