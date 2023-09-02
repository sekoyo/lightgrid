import { lazy } from 'react'
import { Route } from 'wouter'
import { DemoContainer } from './components/DemoContainer'

const params = new URLSearchParams(window.location.search)
const height = Number(params.get('height')) || 800
const theme = params.get('theme') === 'light' ? 'light' : 'dark'

const BasicGridDemo = lazy(() => import('./demos/BasicGridDemo'))
const KitchenSinkDemo = lazy(() => import('./demos/KitchenSinkDemo'))
const ThemingDemo = lazy(() => import('./demos/ThemingDemo'))
const GlobalSearchDemo = lazy(() => import('./demos/GlobalSearchDemo'))
const AsyncDataDemo = lazy(() => import('./demos/AsyncDataDemo'))
const FinitePaginationDemo = lazy(() => import('./demos/FinitePaginationDemo'))

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
      <Route path="/demos/global-search">
        <DemoContainer height={height}>
          <GlobalSearchDemo theme={theme} />
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
    </>
  )
}
