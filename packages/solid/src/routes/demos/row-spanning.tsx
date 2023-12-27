import { GroupedColumns, darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid, N } from '@lightfin/solid-datagrid'
import { DemoProps } from './types'

import '@lightfin/datagrid/dist/styles.css'

interface SomeData {
  id: string
  col1: string
  col2: string
  col3: string
}

const data: SomeData[] = [
  {
    id: '32r2o3pjr',
    col1: 'Col 1',
    col2: 'Col 2',
    col3: 'Col 3',
  },
  {
    id: '9238sK325d',
    col1: 'Col 1',
    col2: 'Span 2 rows',
    col3: 'Col 3',
  },
  {
    id: 'kfsf2r0d22',
    col1: 'Col1',
    col2: 'Col 2',
    col3: 'Col 3',
  },
]

const columns: GroupedColumns<SomeData, N> = [
  {
    key: 'col1',
    getValue: d => d.col1,
  },
  {
    key: 'col2',
    getValue: d => d.col2,
    rowSpan: d => (d.id === '9238sK325d' ? 2 : 1),
  },
  {
    key: 'col3',
    getValue: d => d.col3,
  },
]

export default function Demo({ theme }: DemoProps) {
  return (
    <DataGrid<SomeData>
      columns={columns}
      data={data}
      getRowId={d => d.id}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
