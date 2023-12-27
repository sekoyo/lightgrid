import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/solid-datagrid'
import { animalData, Animal, columns } from 'src/demo-data/animals'
import { DemoProps } from './types'

import '@lightfin/datagrid/dist/styles.css'

export default function Demo({ theme }: DemoProps) {
  return (
    <DataGrid<Animal>
      columns={columns}
      data={animalData}
      getRowId={d => d.animal}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
