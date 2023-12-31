import { DataGrid, darkTheme, lightTheme } from '@lightgrid/react'
import { DemoProps } from './types'
import { animalData, Animal, columns } from './data/animals'

import '@lightgrid/react/dist/style.css'

export default function Demo({ theme }: DemoProps) {
  return (
    <DataGrid<Animal>
      columns={columns}
      data={animalData}
      getRowId={d => d.animal}
      theme={{
        ...(theme === 'light'
          ? {
              ...lightTheme,
              cellEvenBg: 'rgb(235, 240, 255)',
              borderColor: 'rgb(93, 126, 234)',
              headerCellBg: 'rgb(93, 126, 234)',
              headerTextColor: 'white',
            }
          : {
              ...darkTheme,
              cellEvenBg: 'rgb(21, 22, 33)',
              borderColor: 'rgb(93, 126, 234)',
              headerCellBg: 'rgb(93, 126, 234)',
              headerTextColor: 'white',
            }),
      }}
    />
  )
}
