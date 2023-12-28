import { useState } from 'react'
import { GroupedColumns, darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'

import '@lightfin/datagrid/dist/styles.css'

const someData = new Array(10).fill('someValue').map((s, i) => `row ${i}: ${s}`)

const getValue = (s: string) => s

const groupedColumns: GroupedColumns<string, React.ReactNode> = [
  {
    key: 'groupA',
    children: [
      {
        key: 'groupA1',
        getValue,
        width: 200,
      },
      {
        key: 'groupA2',
        getValue,
        width: 200,
      },
      {
        key: 'groupA3',
        getValue,
        width: 200,
      },
    ],
  },
  {
    key: 'groupB',
    children: [
      {
        key: 'groupB1',
        getValue,
        width: 200,
      },
      {
        key: 'groupB2',
        children: [
          {
            key: 'groupB2A',
            getValue,
            width: 200,
          },
          {
            key: 'groupB2B',
            getValue,
            width: 100,
          },
        ],
      },
    ],
  },
  {
    key: 'aNormalColumn',
    header: 'Normal column',
    getValue,
    width: 200,
  },
]

export default function Demo({ theme }: DemoProps) {
  const [columns, setColumns] = useState(groupedColumns)
  return (
    <DataGrid<string>
      columns={columns}
      onColumnsChange={setColumns}
      enableColumnReorder
      data={someData}
      getRowId={d => d}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
