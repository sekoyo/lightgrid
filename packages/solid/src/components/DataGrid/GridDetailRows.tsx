import { For, type JSX } from 'solid-js'
import { DerivedDetailRow } from '@lightfin/datagrid'

interface GridDetailRowsProps<T> {
  itemDetails: DerivedDetailRow<T>[]
  width: number
  renderRowDetails: (item: T) => JSX.Element
}

export function GridDetailRows<T>({
  itemDetails,
  width,
  renderRowDetails,
}: GridDetailRowsProps<T>) {
  return (
    <For each={itemDetails}>
      {detailRow => (
        <div
          class="lg-detail-row"
          style={{
            height: `${detailRow.size}px`,
            transform: `translateY(${detailRow.offset}px)`,
          }}
        >
          <div class="lg-detail-row-inner" style={{ width: `${width}px` }}>
            {renderRowDetails(detailRow.item)}
          </div>
        </div>
      )}
    </For>
  )
}
