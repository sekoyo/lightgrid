import { useState } from 'react'
import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'
import {
  happinessData,
  happinessColumns,
  HappinessEntry,
} from './data/happiness'

import '@lightfin/datagrid/dist/styles.css'

export default function Demo({ theme }: DemoProps) {
  const [columns, setColumns] = useState(happinessColumns)
  return (
    <DataGrid<HappinessEntry>
      columns={columns}
      onColumnsChange={setColumns}
      data={happinessData}
      getRowId={d => d.country}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
