import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'
import { data, columns, LifeExpectancy } from './data/lifeExpectancy'

import '@lightfin/datagrid/dist/styles.css'

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
