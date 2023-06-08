import type {
  GetRowMeta,
  GetRowDetailsMeta,
  DerivedRow,
  DerivedDetailRow,
  RowState,
  GetRowId,
  DerivedRowResult,
  DerivedRowsResult,
} from '../types'

function deriveRowsForGroup<T>(
  data: T[],
  rowState: RowState,
  getRowId: GetRowId<T>,
  getRowMeta: GetRowMeta<T>,
  getRowDetailsMeta: GetRowDetailsMeta<T>,
  startOffset: number,
  startIndexOffset: number
): DerivedRowResult<T> {
  const items: DerivedRow<T>[] = []
  const itemDetails: DerivedDetailRow<T>[] = []
  let offset = 0

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const rowId = getRowId(item)
    const meta = getRowMeta(item)

    const derivedRow: DerivedRow<T> = {
      item,
      rowId,
      size: meta.height,
      hasDetails: meta.hasDetails,
      offset,
      rowIndex: startIndexOffset + i,
    }

    items.push(derivedRow)
    offset += meta.height

    if (meta.hasDetails && rowState[rowId]?.detailsExpanded) {
      const detailsMeta = getRowDetailsMeta(item)

      const detailsRow: DerivedDetailRow<T> = {
        item,
        rowId,
        size: detailsMeta.height,
        offset,
      }

      itemDetails.push(detailsRow)
      offset += detailsMeta.height
    }
  }

  return { items, itemDetails, size: offset, startOffset, startIndexOffset }
}

export function deriveRows<T>(
  pinnedTopData: T[],
  data: T[],
  pinnedBottomData: T[],
  rowState: RowState,
  headerHeight: number,
  getRowId: GetRowId<T>,
  getRowMeta: GetRowMeta<T>,
  getRowDetailsMeta: GetRowDetailsMeta<T>
): DerivedRowsResult<T> {
  const start = deriveRowsForGroup(
    pinnedTopData,
    rowState,
    getRowId,
    getRowMeta,
    getRowDetailsMeta,
    headerHeight,
    0
  )
  const middle = deriveRowsForGroup(
    data,
    rowState,
    getRowId,
    getRowMeta,
    getRowDetailsMeta,
    headerHeight + start.size,
    start.items.length
  )
  const end = deriveRowsForGroup(
    pinnedBottomData,
    rowState,
    getRowId,
    getRowMeta,
    getRowDetailsMeta,
    headerHeight + start.size + middle.size,
    start.items.length + middle.items.length
  )
  return {
    start,
    middle,
    end,
    totalItems: start.items.length + middle.items.length + end.items.length,
  }
}
