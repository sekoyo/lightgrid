/* @refresh reload */
import { render } from 'solid-js/web'
import { Router } from '@solidjs/router'

import { FrameworkTabProvider } from './components/FrameworkTabContext'
import { ThemeProvider, getInitialTheme } from './components/ThemeProvider'
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
    <ThemeProvider theme={getInitialTheme()}>
      <FrameworkTabProvider activeTabId="react">
        <Router>
          <App />
        </Router>
      </FrameworkTabProvider>
    </ThemeProvider>
  ),
  root
)
