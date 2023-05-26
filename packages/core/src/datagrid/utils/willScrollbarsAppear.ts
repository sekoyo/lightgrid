export function willScrollbarsAppear(
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number,
  scrollbarSize: number
) {
  let hasHScroll = false
  let hasVScroll = false
  let lastHasHScroll, lastHasVScroll

  do {
    lastHasHScroll = hasHScroll
    lastHasVScroll = hasVScroll

    const effectiveWidth: number = viewportWidth - (hasVScroll ? scrollbarSize : 0)
    const effectiveHeight: number = viewportHeight - (hasHScroll ? scrollbarSize : 0)

    hasHScroll = contentWidth > effectiveWidth
    hasVScroll = contentHeight > effectiveHeight
  } while (hasHScroll !== lastHasHScroll || hasVScroll !== lastHasVScroll)

  return { hasHScroll, hasVScroll }
}
