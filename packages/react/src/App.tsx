import { useState } from 'react'
import { DataGrid } from './datagrid'
import './App.css'

function App() {
  const [columns, setColumns] = useState([])

  return (
    <div>
      <DataGrid columns={columns} />
    </div>
  )
}

export default App
