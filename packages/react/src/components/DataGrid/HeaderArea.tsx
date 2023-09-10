import { Fragment, useCallback } from 'react'
import {
  AreaPos,
  GroupedDerivedColumns,
  GridManager,
  ItemId,
  isDerivedColumnGroup,
} from '@lightfin/datagrid'

import { R } from './types'
import { HeaderCell } from './HeaderCell'

interface HeaderAreaProps<T> {
  mgr: GridManager<T, React.ReactNode>
  columns: GroupedDerivedColumns<T, N>
  colAreaPos: AreaPos
  headerRowHeight: number
  left: number
  width: number
  height: number
  enableColumnResize?: boolean
  enableColumnReorder?: boolean
  colReorderKey?: ItemId
}

export function HeaderArea<T>({
  mgr,
  columns,
  colAreaPos,
  headerRowHeight,
  left,
  width,
  height,
  enableColumnResize,
  enableColumnReorder,
  colReorderKey,
}: HeaderAreaProps<T>) {
  const renderColumns = useCallback(
    (groupCols: GroupedDerivedColumns<T, N>) => {
      return (
        <>
          {groupCols.map(column => (
            <Fragment key={column.key}>
              <HeaderCell
                mgr={mgr}
                column={column}
                colAreaPos={colAreaPos}
                headerRowHeight={headerRowHeight}
                enableColumnResize={enableColumnResize}
                enableColumnReorder={enableColumnReorder}
                colReorderKey={colReorderKey}
              />
              {isDerivedColumnGroup(column) && renderColumns(column.children)}
            </Fragment>
          ))}
        </>
      )
    },
    [
      colAreaPos,
      colReorderKey,
      enableColumnReorder,
      enableColumnResize,
      headerRowHeight,
      mgr,
    ]
  )

  if (!columns.length) {
    return null
  }

  return (
    <div className="lfg-header-area">
      <div className="lfg-header-area-inner" style={{ left, width, height }}>
        {renderColumns(columns)}
      </div>
    </div>
  )
}
