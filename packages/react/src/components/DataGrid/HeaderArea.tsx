import { Fragment, useCallback, memo } from 'react'
import {
  AreaPos,
  isDerivedColumnGroup,
  type DerivedColumn,
  type GroupedDerivedColumns,
  type GridManager,
  type ItemId,
  type OnFiltersChange,
} from '@lightfin/datagrid'

import { N } from './types'
import { HeaderCell } from './HeaderCell'
import { FilterCell } from './FilterCell'

interface HeaderAreaProps<T> {
  mgr: GridManager<T, N>
  columns: GroupedDerivedColumns<T, N>
  flatColumns: DerivedColumn<T, N>[]
  colAreaPos: AreaPos
  headerRowHeight: number
  filterRowHeight: number
  onFiltersChangeRef: React.MutableRefObject<OnFiltersChange<T, N>>
  left: number
  width: number
  height: number
  enableColumnResize?: boolean
  enableColumnReorder?: boolean
  colReorderKey?: ItemId
}

function _HeaderArea<T>({
  mgr,
  columns,
  flatColumns,
  colAreaPos,
  headerRowHeight,
  filterRowHeight,
  onFiltersChangeRef,
  left,
  width,
  height,
  enableColumnResize,
  enableColumnReorder,
  colReorderKey,
}: HeaderAreaProps<T>) {
  const lastIndex = flatColumns.at(-1)?.colIndex ?? 0
  const renderColumns = useCallback(
    (
      mgr: GridManager<T, React.ReactNode>,
      groupCols: GroupedDerivedColumns<T, N>,
      colAreaPos: AreaPos,
      headerRowHeight: number,
      enableColumnReorder?: boolean,
      enableColumnResize?: boolean,
      colReorderKey?: ItemId
    ) => (
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
              isLastInRow={column.colIndex + (column.headerColSpan - 1) === lastIndex}
            />
            {isDerivedColumnGroup(column) &&
              renderColumns(
                mgr,
                column.children,
                colAreaPos,
                headerRowHeight,
                enableColumnReorder,
                enableColumnResize,
                colReorderKey
              )}
          </Fragment>
        ))}
      </>
    ),
    [lastIndex]
  )

  const renderFilters = useCallback(
    (
      mgr: GridManager<T, React.ReactNode>,
      flatColumns: DerivedColumn<T, N>[],
      filterRowHeight: number
    ) => {
      if (!mgr.columnsHaveFilters()) {
        return null
      }
      return (
        <div className="lg-header-filters" style={{ height: filterRowHeight }}>
          {flatColumns.reduce((vnode, column) => {
            if (column.filterComponent) {
              vnode.push(
                <FilterCell
                  key={column.key}
                  column={column}
                  filterRowHeight={filterRowHeight}
                >
                  {column.filterComponent(value =>
                    onFiltersChangeRef.current(column, value)
                  )}
                </FilterCell>
              )
            }
            return vnode
          }, [] as React.ReactNode[])}
          <div className="lg-header-filters-v-borders" />
        </div>
      )
    },
    [onFiltersChangeRef]
  )

  if (!columns.length) {
    return null
  }

  return (
    <div className="lg-header-area">
      <div className="lg-header-area-inner" style={{ left, width, height }}>
        {renderColumns(
          mgr,
          columns,
          colAreaPos,
          headerRowHeight,
          enableColumnReorder,
          enableColumnResize,
          colReorderKey
        )}
        {renderFilters(mgr, flatColumns, filterRowHeight)}
      </div>
    </div>
  )
}

const typedMemo: <T>(c: T) => T = memo
export const HeaderArea = typedMemo(_HeaderArea)
