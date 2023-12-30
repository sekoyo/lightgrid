import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/solid-datagrid'
import { animalData, Animal, columns } from 'src/demo-data/animals'
import { DemoProps } from './types'

import '@lightfin/datagrid/dist/styles.css'

export default function Demo(props: DemoProps) {
  return (
    <DataGrid<Animal>
      columns={columns}
      data={animalData}
      getRowId={d => d.animal}
      theme={{
        ...(props.theme === 'light'
          ? {
              ...lightTheme,
              evenRowCellBg: 'rgb(235, 240, 255)',
              borderColor: 'rgb(93, 126, 234)',
              headerCellBg: 'rgb(93, 126, 234)',
              headerInnerBorderColor: 'white',
              headerTextColor: 'white',
            }
          : {
              ...darkTheme,
              evenRowCellBg: 'rgb(21, 22, 33)',
              borderColor: 'rgb(93, 126, 234)',
              headerCellBg: 'rgb(93, 126, 234)',
              headerInnerBorderColor: 'white',
              headerTextColor: 'white',
            }),
      }}
    />
  )
}
