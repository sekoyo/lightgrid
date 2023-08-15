import { darkTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { animalData, Animal, animalColumns } from './data/animals'

import '@lightfin/datagrid/dist/styles.css'

export default function Demo() {
  return (
    <DataGrid<Animal>
      columns={animalColumns}
      data={animalData}
      getRowId={d => d.animal}
      theme={{
        ...darkTheme,
        evenRowCellBg: 'rgb(21, 22, 33)',
        borderColor: 'rgb(93, 126, 234)',
        headerCellBg: 'rgb(93, 126, 234)',
        headerInnerBorderColor: 'white',
        headerTextColor: 'white',
      }}
    />
  )
}
