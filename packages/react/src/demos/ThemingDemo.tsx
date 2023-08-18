import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'
import { animalData, Animal, animalColumns } from './data/animals'

import '@lightfin/datagrid/dist/styles.css'

export default function Demo({ theme }: DemoProps) {
  return (
    <DataGrid<Animal>
      columns={animalColumns}
      data={animalData}
      getRowId={d => d.animal}
      theme={{
        ...(theme === 'light'
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
