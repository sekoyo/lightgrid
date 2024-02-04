import {
  DataGrid,
  GroupedColumns,
  darkTheme,
  lightTheme,
} from '@lightgrid/react'
import { DemoProps } from './types'

import '@lightgrid/react/dist/style.css'

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
    col2: 'Span 2 cols',
    col3: 'Col 3',
  },
  {
    id: 'kfsf2r0d22',
    col1: 'Spans all columns',
    col2: 'Col 2',
    col3: 'Col 3',
  },
]

const columns: GroupedColumns<SomeData> = [
  {
    key: 'col1',
    getValue: d => d.col1,
    colSpan: d => (d.id === 'kfsf2r0d22' ? -1 : 1),
  },
  {
    key: 'col2',
    getValue: d => d.col2,
    colSpan: d => (d.id === '9238sK325d' ? 2 : 1),
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
      getRowKey={d => d.id}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
