import { useState } from 'react'
import {
  CellComponentProps,
  GroupedColumns,
  darkTheme,
  lightTheme,
} from '@lightfin/datagrid'
import { DataGrid, N } from '@lightfin/react-datagrid'
import { DemoProps } from './types'

import '@lightfin/datagrid/dist/styles.css'

const someData = new Array(10).fill('_').map((_, i) => `row ${i}`)

const getValue = (s: string) => s

const cellComponent = ({ column }: CellComponentProps<string, N>) => (
  <span style={{ padding: '0 var(--lgCellHPadding)' }}>{column.key}</span>
)

const groupedColumns: GroupedColumns<string, N> = [
  {
    key: 'groupA',
    children: [
      {
        key: 'groupA1',
        getValue,
        cellComponent,
      },
      {
        key: 'groupA2',
        getValue,
        cellComponent,
      },
      {
        key: 'groupA3',
        getValue,
        cellComponent,
      },
    ],
  },
  {
    key: 'groupB',
    children: [
      {
        key: 'groupB1',
        getValue,
        cellComponent,
      },
      {
        key: 'groupB2',
        children: [
          {
            key: 'groupB2A',
            getValue,
            cellComponent,
          },
          {
            key: 'groupB2B',
            getValue,
            cellComponent,
          },
        ],
      },
    ],
  },
  {
    key: 'aNormalColumn',
    header: 'Normal column',
    getValue,
    cellComponent,
    width: 140,
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
