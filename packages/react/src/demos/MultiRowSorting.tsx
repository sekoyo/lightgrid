import { useState } from 'react'
import {
  DataGrid,
  GroupedColumns,
  darkTheme,
  lightTheme,
} from '@lightgrid/react'

import { DemoProps } from './types'
import { data, columns, LifeExpectancy } from './data/lifeExpectancy'

import '@lightgrid/react/dist/style.css'

const sortableColumns: GroupedColumns<LifeExpectancy> = columns.map(c => ({
  ...c,
  sortable: true,
}))

export default function Demo({ theme }: DemoProps) {
  const [columns, setColumns] = useState(sortableColumns)
  return (
    <DataGrid<LifeExpectancy>
      columns={columns}
      onColumnsChange={setColumns}
      data={data}
      multiSort
      getRowId={d => d.country + d.year}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
