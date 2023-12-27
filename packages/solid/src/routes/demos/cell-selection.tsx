import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/solid-datagrid'
import { data, columns, LifeExpectancy } from 'src/demo-data/lifeExpectancy'
import { DemoProps } from './types'

import '@lightfin/datagrid/dist/styles.css'

export default function Demo({ theme }: DemoProps) {
  return (
    <DataGrid<LifeExpectancy>
      columns={columns}
      pinnedTopData={data.slice(0, 1)}
      data={data.slice(1, -1)}
      pinnedBottomData={data.slice(-1)}
      getRowId={d => d.country + d.year}
      enableCellSelection
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
