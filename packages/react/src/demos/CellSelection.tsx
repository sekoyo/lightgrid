import { DataGrid, darkTheme, lightTheme } from '@lightgrid/react'
import { DemoProps } from './types'
import { data, columns, LifeExpectancy } from './data/lifeExpectancy'

import '@lightgrid/react/dist/style.css'

export default function Demo({ theme }: DemoProps) {
  return (
    <DataGrid<LifeExpectancy>
      columns={columns}
      pinnedTopData={data.slice(0, 1)}
      data={data.slice(1, -1)}
      pinnedBottomData={data.slice(-1)}
      getRowKey={d => d.country + d.year}
      enableCellSelection
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
