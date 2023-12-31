import { DataGrid, darkTheme, lightTheme } from '@lightgrid/react'
import { DemoProps } from './types'
import { data, columns, LifeExpectancy } from './data/lifeExpectancy'

import '@lightgrid/react/dist/style.css'

export default function Demo({ theme }: DemoProps) {
  return (
    <DataGrid<LifeExpectancy>
      columns={columns}
      data={data}
      getRowId={d => d.country + d.year}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
