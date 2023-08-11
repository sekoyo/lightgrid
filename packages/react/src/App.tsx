import { lazy } from 'react'
import { Route } from 'wouter'

const params = new URLSearchParams(window.location.search)
const height = Number(params.get('height')) || 800

const BasicGridDemo = lazy(() => import('./demos/BasicGrid'))

export function App() {
  return (
    <>
      <Route path="/demos/basic-grid">
        <BasicGridDemo height={height} />
      </Route>
    </>
  )
}
