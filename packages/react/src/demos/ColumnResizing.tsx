import { useState } from 'react'
import { DataGrid, darkTheme, lightTheme } from '@lightgrid/react'
import { DemoProps } from './types'
import { animalData, Animal, columns } from './data/animals'

import '@lightgrid/react/dist/style.css'

export default function Demo({ theme }: DemoProps) {
  const [animalColumns, setAnimalColumns] = useState(columns)
  return (
    <DataGrid<Animal>
      columns={animalColumns}
      data={animalData}
      getRowId={d => d.animal}
      enableColumnResize
      onColumnsChange={setAnimalColumns}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
