import { createEffect, type Component } from 'solid-js'
import { Route } from '@solidjs/router'

import { Home } from 'src/pages/Homes'
import { Docs } from 'src/pages/Docs'
import { useTheme } from './components/ThemeProvider'

const App: Component = () => {
  const { state } = useTheme()
  createEffect(() => {
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(state.theme)
  })
  return (
    <>
      <Route path="/" component={Home} />
      <Route path="/docs/*slug" component={Docs} />
    </>
  )
}

export default App
