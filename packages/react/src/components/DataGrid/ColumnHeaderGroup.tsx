import { Fragment, memo } from 'react'
import { DerivedGroupColumns, isDerivedColumnGroup } from '@lightfin/datagrid'

import { R } from './types'
import { ColumnHeader } from './ColumnHeader'

interface ColumnHeaderGroupProps<T> {
  columns: DerivedGroupColumns<T, R>
  headerRowHeight: number
  isFirstRow?: boolean
  isFirstGroup?: boolean
  isLastGroup?: boolean
}

function ColumnHeaderGroupNoMemo<T>({
  columns,
  headerRowHeight,
  isFirstRow = true,
  isFirstGroup,
  isLastGroup,
}: ColumnHeaderGroupProps<T>) {
  return (
    <>
      {columns.map((column, i) => (
        <Fragment key={column.key}>
          <ColumnHeader
            column={column}
            headerRowHeight={headerRowHeight}
            isTopEdge={isFirstRow}
            isLeftEdge={isFirstGroup && i === 0}
            isRightEdge={isLastGroup && i === columns.length - 1}
          />
          {isDerivedColumnGroup(column) && (
            <ColumnHeaderGroupNoMemo<T>
              columns={column.children}
              headerRowHeight={headerRowHeight}
              isFirstRow={false}
              isFirstGroup={isFirstGroup}
              isLastGroup={isLastGroup}
            />
          )}
        </Fragment>
      ))}
    </>
  )
}

const typedMemo: <T>(c: T) => T = memo
export const ColumnHeaderGroup = typedMemo(ColumnHeaderGroupNoMemo)
