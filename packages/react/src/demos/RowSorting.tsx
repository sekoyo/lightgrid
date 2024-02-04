import { useState } from 'react'
import { DataGrid, darkTheme, lightTheme } from '@lightgrid/react'
import { DemoProps } from './types'
import {
  happinessData,
  happinessColumns,
  HappinessEntry,
} from './data/happiness'

import '@lightgrid/react/dist/style.css'

export default function Demo({ theme }: DemoProps) {
  const [columns, setColumns] = useState(happinessColumns)
  return (
    <DataGrid<HappinessEntry>
      columns={columns}
      onColumnsChange={setColumns}
      data={happinessData}
      getRowKey={d => d.country}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
