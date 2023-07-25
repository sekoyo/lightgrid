import { memo } from 'react'
import { AreaPos, GroupedDerivedColumns, GridManager, ItemId } from '@lightfin/datagrid'

import { R } from './types'
import { ColumnHeaderGroup } from './ColumnHeaderGroup'

interface HeaderAreaProps<T> {
  mgr: GridManager<T, React.ReactNode>
  columns: GroupedDerivedColumns<T, R>
  colAreaPos: AreaPos
  headerRowHeight: number
  left: number
  width: number
  height: number
  enableColumnResize?: boolean
  enableColumnReorder?: boolean
  colResizeData?: number
  colReorderKey?: ItemId
}

export function HeaderAreaNoMemo<T>({
  mgr,
  columns,
  colAreaPos,
  headerRowHeight,
  left,
  width,
  height,
  enableColumnResize,
  enableColumnReorder,
  colResizeData,
  colReorderKey,
}: HeaderAreaProps<T>) {
  if (!columns.length) {
    return null
  }

  return (
    <div className="lfg-header-area">
      <div className="lfg-header-area-inner" style={{ left, width, height }}>
        <ColumnHeaderGroup
          mgr={mgr}
          columns={columns}
          colAreaPos={colAreaPos}
          headerRowHeight={headerRowHeight}
          enableColumnResize={enableColumnResize}
          enableColumnReorder={enableColumnReorder}
          colResizeData={colResizeData}
          colReorderKey={colReorderKey}
        />
      </div>
    </div>
  )
}

const typedMemo: <T>(c: T) => T = memo
export const HeaderArea = typedMemo(HeaderAreaNoMemo)
