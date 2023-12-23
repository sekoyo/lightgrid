import { GroupedColumns, darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'

import '@lightfin/datagrid/dist/styles.css'

const someData = new Array(5).fill('someValue').map((s, i) => `row ${i}: ${s}`)

const getValue = (s: string) => s

const columns: GroupedColumns<string, React.ReactNode> = [
  {
    key: 'aNormalColumn',
    header: 'Normal column',
    getValue,
  },
  {
    key: 'groupA',
    children: [
      {
        key: 'groupA1',
        getValue,
      },
      {
        key: 'groupA2',
        getValue,
      },
      {
        key: 'groupA3',
        getValue,
      },
    ],
  },
  {
    key: 'groupB',
    children: [
      {
        key: 'groupB1',
        getValue,
      },
      {
        key: 'groupB2',
        children: [
          {
            key: 'groupB2A',
            getValue,
          },
          {
            key: 'groupB2B',
            getValue,
          },
        ],
      },
    ],
  },
]

export default function Demo({ theme }: DemoProps) {
  return (
    <DataGrid<string>
      columns={columns}
      data={someData}
      getRowId={d => d}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
