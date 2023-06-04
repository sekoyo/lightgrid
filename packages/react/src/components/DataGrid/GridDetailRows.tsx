import { DerivedDetailRow } from '@lightfin/datagrid'

interface GridDetailRowsProps<T> {
  itemDetails: DerivedDetailRow<T>[]
  width: number
  renderRowDetails: (item: T) => React.ReactNode
}

export function GridDetailRows<T>({
  itemDetails,
  width,
  renderRowDetails,
}: GridDetailRowsProps<T>) {
  return (
    <>
      {itemDetails.map(detailRow => (
        <div
          key={detailRow.rowId}
          className="lfg-detail-row"
          style={{
            width,
            height: detailRow.size,
            transform: `translateY(${detailRow.offset}px)`,
          }}
        >
          <div className="lfg-detail-row-inner">{renderRowDetails(detailRow.item)}</div>
        </div>
      ))}
    </>
  )
}
