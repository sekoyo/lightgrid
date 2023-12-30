import { createSignal } from 'solid-js'
import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/solid-datagrid'
import { DemoProps } from './types'
import { animalData, Animal, columns } from 'src/demo-data/animals'

import '@lightfin/datagrid/dist/styles.css'

export default function Demo(props: DemoProps) {
  const [animalColumns, setAnimalColumns] = createSignal(columns)
  return (
    <DataGrid<Animal>
      columns={animalColumns}
      data={animalData}
      getRowId={d => d.animal}
      enableColumnResize
      onColumnsChange={setAnimalColumns}
      theme={props.theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
