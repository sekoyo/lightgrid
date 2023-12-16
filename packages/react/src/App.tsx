import { lazy } from 'react'
import { Route } from 'wouter'
import { DemoContainer } from './components/DemoContainer'

const params = new URLSearchParams(window.location.search)
const height = Number(params.get('height')) || 800
const theme = params.get('theme') === 'light' ? 'light' : 'dark'

const BasicGridDemo = lazy(() => import('./demos/BasicGrid'))
const KitchenSinkDemo = lazy(() => import('./demos/KitchenSink'))
const ThemingDemo = lazy(() => import('./demos/Theming'))
const GlobalFilteringDemo = lazy(() => import('./demos/GlobalFiltering'))
const AsyncDataDemo = lazy(() => import('./demos/AsyncData'))
const FinitePaginationDemo = lazy(() => import('./demos/FinitePagination'))
const InfinitePaginationDemo = lazy(() => import('./demos/InfinitePagination'))
const ColumnGroupingDemo = lazy(() => import('./demos/ColumnGrouping'))
const ColumnFilteringDemo = lazy(() => import('./demos/ColumnFiltering'))
const ColumnPinningDemo = lazy(() => import('./demos/ColumnPinning'))
const ColumnResizingDemo = lazy(() => import('./demos/ColumnResizing'))
const ColumnReorderingDemo = lazy(() => import('./demos/ColumnReordering'))
const RowSortingDemo = lazy(() => import('./demos/RowSorting'))
const MultiRowSortingDemo = lazy(() => import('./demos/MultiRowSorting'))
const RowGroupingDemo = lazy(() => import('./demos/RowGrouping'))
const RowPinningDemo = lazy(() => import('./demos/RowPinning'))
const DetailRowsDemo = lazy(() => import('./demos/DetailRows'))

document.body.classList.add(theme)

export function App() {
  return (
    <>
      <Route path="/demos/basic-grid">
        <DemoContainer height={height}>
          <BasicGridDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/kitchen-sink">
        <DemoContainer height={height}>
          <KitchenSinkDemo />
        </DemoContainer>
      </Route>
      <Route path="/demos/theming">
        <DemoContainer height={height}>
          <ThemingDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/global-filtering">
        <DemoContainer height={height}>
          <GlobalFilteringDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/async-data">
        <DemoContainer height={height}>
          <AsyncDataDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/finite-pagination">
        <DemoContainer height={height}>
          <FinitePaginationDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/infinite-pagination">
        <DemoContainer height={height}>
          <InfinitePaginationDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/column-grouping">
        <DemoContainer height={height}>
          <ColumnGroupingDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/column-filtering">
        <DemoContainer height={height}>
          <ColumnFilteringDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/column-pinning">
        <DemoContainer height={height}>
          <ColumnPinningDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/column-resizing">
        <DemoContainer height={height}>
          <ColumnResizingDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/column-reordering">
        <DemoContainer height={height}>
          <ColumnReorderingDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/row-sorting">
        <DemoContainer height={height}>
          <RowSortingDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/multi-col-row-sorting">
        <DemoContainer height={height}>
          <MultiRowSortingDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/row-grouping">
        <DemoContainer height={height}>
          <RowGroupingDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/row-pinning">
        <DemoContainer height={height}>
          <RowPinningDemo theme={theme} />
        </DemoContainer>
      </Route>
      <Route path="/demos/detail-rows">
        <DemoContainer height={height}>
          <DetailRowsDemo theme={theme} />
        </DemoContainer>
      </Route>
    </>
  )
}
