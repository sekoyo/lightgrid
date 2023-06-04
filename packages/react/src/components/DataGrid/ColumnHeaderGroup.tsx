import { Fragment, memo } from 'react'
import { DerivedGroupColumns, isDerivedColumnGroup } from '@lightfin/datagrid'

import { R } from './types'
import { ColumnHeader } from './ColumnHeader'

interface ColumnHeaderGroupProps<T> {
  columns: DerivedGroupColumns<T, R>
  headerRowHeight: number
}

function ColumnHeaderGroupNoMemo<T>({
  columns,
  headerRowHeight,
}: ColumnHeaderGroupProps<T>) {
  return (
    <>
      {columns.map((column, i) => (
        <Fragment key={column.key}>
          <ColumnHeader column={column} headerRowHeight={headerRowHeight} />
          {isDerivedColumnGroup(column) && (
            <ColumnHeaderGroupNoMemo<T>
              columns={column.children}
              headerRowHeight={headerRowHeight}
            />
          )}
        </Fragment>
      ))}
    </>
  )
}

const typedMemo: <T>(c: T) => T = memo
export const ColumnHeaderGroup = typedMemo(ColumnHeaderGroupNoMemo)
