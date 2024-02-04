import { DataGrid, darkTheme, lightTheme } from '@lightgrid/react'
import { DemoProps } from './types'
import { animalData, Animal, columns } from './data/animals'

import '@lightgrid/react/dist/style.css'

export default function Demo({ theme }: DemoProps) {
  return (
    <DataGrid<Animal>
      columns={columns}
      data={animalData}
      getRowKey={d => d.animal}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
