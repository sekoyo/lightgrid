import { Fragment, memo, useCallback } from 'react'
import {
  AreaPos,
  DerivedGroupColumns,
  GridManager,
  isDerivedColumnGroup,
} from '@lightfin/datagrid'

import { R } from './types'
import { ColumnHeader } from './ColumnHeader'

interface ColumnHeaderGroupProps<T> {
  mgr: GridManager<T, React.ReactNode>
  columns: DerivedGroupColumns<T, R>
  colAreaPos: AreaPos
  headerRowHeight: number
  enableColumnResize?: boolean
  colResizeData?: number
}

function ColumnHeaderGroupNoMemo<T>({
  mgr,
  columns,
  colAreaPos,
  headerRowHeight,
  enableColumnResize,
  colResizeData,
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
          />
          {isDerivedColumnGroup(column) && (
            <ColumnHeaderGroupNoMemo<T>
              mgr={mgr}
              columns={column.children}
              colAreaPos={colAreaPos}
              headerRowHeight={headerRowHeight}
              enableColumnResize={enableColumnResize}
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
