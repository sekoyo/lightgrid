import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/solid-datagrid'
import { DemoProps } from './types'
import { data, columns, LifeExpectancy } from 'src/demo-data/lifeExpectancy'

import '@lightfin/datagrid/dist/styles.css'

export default function Demo(props: DemoProps) {
  return (
    <DataGrid<LifeExpectancy>
      columns={columns}
      data={data}
      getRowId={d => d.country + d.year}
      theme={props.theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
