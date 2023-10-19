import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'
import { animalData, Animal, columns } from './data/animals'

import '@lightfin/datagrid/dist/styles.css'
import { useState } from 'react'

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
