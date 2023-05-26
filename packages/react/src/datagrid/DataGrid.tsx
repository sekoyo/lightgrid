import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_GET_ROW_DETAILS_META,
  DEFAULT_GET_ROW_META,
  DEFAULT_HEADER_ROW_HEIGHT,
  GetRowDetailsMeta,
  GetRowId,
  GetRowMeta,
  GroupedColumns,
  OnRowStateChange,
  RenderRowDetails,
  RowState,
  createGridManager,
} from '@lightfin/core'

const EMPTY_DATA: any[] = []
const EMPTY_ROW_STATE: RowState = {}
const NOOP = () => {
  /**/
}
const DEFAULT_ROW_DETAILS_RENDERER = () => (
  <div>Define a `renderRowDetails` to customize this</div>
)

interface DataGridProps<T> {
  columns: GroupedColumns<T, React.ReactNode>
  headerRowHeight?: number
  getRowId: GetRowId<T>
  getRowMeta?: GetRowMeta<T>
  getRowDetailsMeta?: GetRowDetailsMeta<T>
  data: T[]
  pinnedTopData?: T[]
  pinnedBottomData?: T[]
  rowState?: RowState
  renderRowDetails?: RenderRowDetails<T, React.ReactNode>
  onRowStateChange?: OnRowStateChange
  direction?: 'ltr' | 'rtl'
}

export function DataGrid<T>({
  columns,
  headerRowHeight = DEFAULT_HEADER_ROW_HEIGHT,
  getRowId,
  getRowMeta = DEFAULT_GET_ROW_META,
  getRowDetailsMeta = DEFAULT_GET_ROW_DETAILS_META,
  data,
  pinnedTopData = EMPTY_DATA,
  pinnedBottomData = EMPTY_DATA,
  rowState = EMPTY_ROW_STATE,
  renderRowDetails = DEFAULT_ROW_DETAILS_RENDERER,
  onRowStateChange = NOOP,
  direction,
}: DataGridProps<T>) {
  const gridEl = useRef<HTMLDivElement>(null)
  const [mgr] = useState(() =>
    createGridManager({
      getRowId,
      getRowMeta,
      getRowDetailsMeta,
      renderRowDetails,
      onRowStateChange,
    })
  )

  useEffect(() => {
    mgr.update({
      columns,
      headerRowHeight,
      data,
      pinnedTopData,
      pinnedBottomData,
      rowState,
    })
  }, [mgr, columns, headerRowHeight, data, pinnedTopData, pinnedBottomData, rowState])

  useEffect(() => {
    if (gridEl.current) {
      mgr.mount(gridEl.current)
      console.log('mounted')
      return () => {
        console.log('calling unmount')
        mgr.unmount()
      }
    }
  }, [mgr])

  return (
    <div ref={gridEl}>
      <p>DataGrid</p>
      <button onClick={() => mgr.unmount()}>unmount</button>
    </div>
  )
}
