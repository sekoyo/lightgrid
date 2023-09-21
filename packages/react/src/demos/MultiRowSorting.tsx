import { useState } from 'react'
import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'
import {
  GrowthEntry,
  lettuceGrowthColumns,
  lettuceGrowthData,
} from './data/lettuceGrowth'

import '@lightfin/datagrid/dist/styles.css'

export default function Demo({ theme }: DemoProps) {
  const [columns, setColumns] = useState(lettuceGrowthColumns)
  return (
    <DataGrid<GrowthEntry>
      columns={columns}
      onColumnsChange={setColumns}
      data={lettuceGrowthData}
      multiSort={true}
      getRowId={d => `${d.id}:${d.date}`}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
