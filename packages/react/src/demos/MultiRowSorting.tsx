import { useState } from 'react'
import {
  // Column,
  GroupedColumns,
  // isColumnGroup,
  darkTheme,
  lightTheme,
} from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'

import { DemoProps } from './types'
import { data, columns, LifeExpectancy } from './data/lifeExpectancy'

import '@lightfin/datagrid/dist/styles.css'

const sortableColumns: GroupedColumns<
  LifeExpectancy,
  React.ReactNode
> = columns.map(c => ({ ...c, sortable: true }))

export default function Demo({ theme }: DemoProps) {
  const [columns, setColumns] = useState(sortableColumns)
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
