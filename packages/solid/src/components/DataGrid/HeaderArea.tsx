import { type JSX } from 'solid-js'
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
  headerRowCount: number
  headerRowHeight: number
  filterRowHeight: number
  onFiltersChange: OnFiltersChange<T, N>
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
  flatColumns,
  colAreaPos,
  headerRowCount,
  headerRowHeight,
  filterRowHeight,
  onFiltersChange,
  left,
  width,
  height,
  enableColumnResize,
  enableColumnReorder,
  colReorderKey,
}: HeaderAreaProps<T>) {
  const outline = headerRowCount > 1
  const renderColumns = (
    mgr: GridManager<T, N>,
    groupCols: GroupedDerivedColumns<T, N>,
    colAreaPos: AreaPos,
    headerRowHeight: number,
    enableColumnReorder?: boolean,
    enableColumnResize?: boolean,
    colReorderKey?: ItemId
  ): JSX.Element => (
    <>
      {groupCols.map(column => (
        <>
          <HeaderCell
            mgr={mgr}
            column={column}
            colAreaPos={colAreaPos}
            headerRowHeight={headerRowHeight}
            enableColumnResize={enableColumnResize}
            enableColumnReorder={enableColumnReorder}
            colReorderKey={colReorderKey}
            outline={outline}
            border={!!column.pin}
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
        </>
      ))}
    </>
  )

  const renderFilters = (
    mgr: GridManager<T, N>,
    flatColumns: DerivedColumn<T, N>[],
    filterRowHeight: number
  ) => {
    if (!mgr.columnsHaveFilters()) {
      return null
    }
    return (
      <div class="lg-header-filters" style={{ height: `${filterRowHeight}px` }}>
        {flatColumns.reduce((vnode, column) => {
          if (column.filterComponent) {
            vnode.push(
              <FilterCell column={column} filterRowHeight={filterRowHeight}>
                {column.filterComponent(value => onFiltersChange(column, value))}
              </FilterCell>
            )
          }
          return vnode
        }, [] as JSX.Element[])}
        <div class="lg-header-filters-v-borders" />
      </div>
    )
  }

  if (!columns.length) {
    return null
  }

  return (
    <div class="lg-header-area">
      <div
        class="lg-header-area-inner"
        style={{ left: `${left}px`, width: `${width}px`, height: `${height}px` }}
      >
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
