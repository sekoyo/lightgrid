// @refresh reload
import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start'
import { Suspense } from 'solid-js'
import { DemoContainer } from './components'
import './app.css'

const params = new URLSearchParams(window.location.search)
const height = params.get('height') || '600px'
const theme = params.get('theme') === 'light' ? 'light' : 'dark'
document.body.classList.add(theme)

export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <Suspense>
            <DemoContainer height={height}>{props.children}</DemoContainer>
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
