import { memo } from 'react'
import { AreaPos, DerivedGroupColumns, GridManager } from '@lightfin/datagrid'

import { R } from './types'
import { ColumnHeaderGroup } from './ColumnHeaderGroup'

interface HeaderAreaProps<T> {
  mgr: GridManager<T, React.ReactNode>
  columns: DerivedGroupColumns<T, R>
  colAreaPos: AreaPos
  headerRowHeight: number
  left: number
  width: number
  height: number
  enableColumnResize?: boolean
  enableColumnReorder?: boolean
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
        />
      </div>
    </div>
  )
}

const typedMemo: <T>(c: T) => T = memo
export const HeaderArea = typedMemo(HeaderAreaNoMemo)
