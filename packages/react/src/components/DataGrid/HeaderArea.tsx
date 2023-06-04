import { memo } from 'react'
import { DerivedGroupColumns } from '@lightfin/datagrid'

import { R } from './types'
import { ColumnHeaderGroup } from './ColumnHeaderGroup'

interface HeaderAreaProps<T> {
  columns: DerivedGroupColumns<T, R>
  headerRowHeight: number
  isFirstGroup: boolean
  isLastGroup: boolean
  left: number
  width: number
  height: number
}

export function HeaderAreaNoMemo<T>({
  columns,
  headerRowHeight,
  isFirstGroup,
  isLastGroup,
  left,
  width,
  height,
}: HeaderAreaProps<T>) {
  if (!columns.length) {
    return null
  }

  return (
    <div className="lfg-header-area">
      <div className="lfg-header-area-inner" style={{ left, width, height }}>
        <ColumnHeaderGroup
          columns={columns}
          headerRowHeight={headerRowHeight}
          isFirstGroup={isFirstGroup}
          isLastGroup={isLastGroup}
        />
      </div>
    </div>
  )
}

const typedMemo: <T>(c: T) => T = memo
export const HeaderArea = typedMemo(HeaderAreaNoMemo)
