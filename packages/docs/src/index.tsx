/* @refresh reload */
import { render } from 'solid-js/web'
import { Router } from '@solidjs/router'

import { FrameworkTabProvider } from './components/FrameworkTabContext'
import App from './App'

import './index.css'

const root = document.getElementById('root')

if (!(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
  )
}

render(
  () => (
    <FrameworkTabProvider activeTabId="react">
      <Router>
        <App />
      </Router>
    </FrameworkTabProvider>
  ),
  root
)
