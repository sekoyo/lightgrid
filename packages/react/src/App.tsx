import { lazy } from 'react'
import { Route } from 'wouter'
import { DemoContainer } from './components/DemoContainer'

const params = new URLSearchParams(window.location.search)
const height = Number(params.get('height')) || 800

const BasicGridDemo = lazy(() => import('./demos/BasicGrid'))
const KitchenSinkDemo = lazy(() => import('./demos/KitchenSink'))

export function App() {
  return (
    <>
      <Route path="/demos/basic-grid">
        <DemoContainer height={height}>
          <BasicGridDemo />
        </DemoContainer>
      </Route>
      <Route path="/demos/kitchen-sink">
        <DemoContainer height={height}>
          <KitchenSinkDemo />
        </DemoContainer>
      </Route>
    </>
  )
}
