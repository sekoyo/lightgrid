import { type JSX, createSignal } from 'solid-js'
import { GroupedColumns, darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/solid-datagrid'

import { data, columns, LifeExpectancy } from 'src/demo-data/lifeExpectancy'
import { DemoProps } from './types'

import '@lightfin/datagrid/dist/styles.css'

const sortableColumns: GroupedColumns<LifeExpectancy, JSX.Element> = columns.map(c => ({
  ...c,
  sortable: true,
}))

export default function Demo({ theme }: DemoProps) {
  const [columns, setColumns] = createSignal(sortableColumns)
  return (
    <DataGrid<LifeExpectancy>
      columns={columns}
      onColumnsChange={setColumns}
      data={data}
      multiSort={true}
      getRowId={d => d.country + d.year}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
