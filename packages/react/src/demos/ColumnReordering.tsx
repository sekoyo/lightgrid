import { useState } from 'react'
import {
  DataGrid,
  CellComponentProps,
  GroupedColumns,
  darkTheme,
  lightTheme,
} from '@lightgrid/react'
import { DemoProps } from './types'

import '@lightgrid/react/dist/style.css'

const someData = new Array(10).fill('_').map((_, i) => `row ${i}`)

const getValue = (s: string) => s

const cellComponent = ({ column }: CellComponentProps<string>) => (
  <span style={{ padding: '0 var(--lgCellHPadding)' }}>{column.key}</span>
)

const groupedColumns: GroupedColumns<string> = [
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
