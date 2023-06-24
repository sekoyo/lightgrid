import type {
  AreaPos,
  GetRowMeta,
  GetRowDetailsMeta,
  DerivedRow,
  DerivedDetailRow,
  RowState,
  GetRowId,
  DerivedRowResult,
} from '../types'

export function deriveRows<T>(
  areaPos: AreaPos,
  data: T[],
  rowState: RowState,
  getRowId: GetRowId<T>,
  getRowMeta: GetRowMeta<T>,
  getRowDetailsMeta: GetRowDetailsMeta<T>,
  getStartOffset: (thiSize: number) => number,
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

  return {
    areaPos,
    items,
    itemDetails,
    size: offset,
    startOffset: getStartOffset(offset),
    startIndexOffset,
  }
}
