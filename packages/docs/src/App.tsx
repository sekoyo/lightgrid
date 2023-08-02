import type { Component } from 'solid-js'
import { Route, Routes } from '@solidjs/router'

import { Home } from 'src/pages/Homes'
import { Docs } from 'src/pages/Docs'

const App: Component = () => {
  return (
    <Routes>
      <Route path="/" component={Home} />
      <Route path="/docs/*slug" component={Docs} />
    </Routes>
  )
}

export default App
