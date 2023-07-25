import { Fragment, memo } from 'react'
import {
  AreaPos,
  GroupedDerivedColumns,
  GridManager,
  isDerivedColumnGroup,
  ItemId,
} from '@lightfin/datagrid'

import { R } from './types'
import { ColumnHeader } from './ColumnHeader'

interface ColumnHeaderGroupProps<T> {
  mgr: GridManager<T, React.ReactNode>
  columns: GroupedDerivedColumns<T, R>
  colAreaPos: AreaPos
  headerRowHeight: number
  enableColumnResize?: boolean
  enableColumnReorder?: boolean
  colResizeData?: number
  colReorderKey?: ItemId
}

function ColumnHeaderGroupNoMemo<T>({
  mgr,
  columns,
  colAreaPos,
  headerRowHeight,
  enableColumnResize,
  enableColumnReorder,
  colResizeData,
  colReorderKey,
}: ColumnHeaderGroupProps<T>) {
  return (
    <>
      {columns.map(column => (
        <Fragment key={column.key}>
          <ColumnHeader
            mgr={mgr}
            column={column}
            colAreaPos={colAreaPos}
            headerRowHeight={headerRowHeight}
            enableColumnResize={enableColumnResize}
            enableColumnReorder={enableColumnReorder}
            colReorderKey={colReorderKey}
          />
          {isDerivedColumnGroup(column) && (
            <ColumnHeaderGroupNoMemo<T>
              mgr={mgr}
              columns={column.children}
              colAreaPos={colAreaPos}
              headerRowHeight={headerRowHeight}
              enableColumnResize={enableColumnResize}
              enableColumnReorder={enableColumnReorder}
              colReorderKey={colReorderKey}
            />
          )}
        </Fragment>
      ))}
      {colResizeData !== undefined && (
        <div className="lfg-column-resize-marker" style={{ left: colResizeData }} />
      )}
    </>
  )
}

const typedMemo: <T>(c: T) => T = memo
export const ColumnHeaderGroup = typedMemo(ColumnHeaderGroupNoMemo)
