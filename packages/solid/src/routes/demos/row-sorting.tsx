import { createSignal } from 'solid-js'
import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/solid-datagrid'
import { DemoProps } from './types'
import {
  happinessData,
  happinessColumns,
  HappinessEntry,
} from '../../demo-data/happiness'

import '@lightfin/datagrid/dist/styles.css'

export default function Demo({ theme }: DemoProps) {
  const [columns, setColumns] = createSignal(happinessColumns)
  return (
    <DataGrid<HappinessEntry>
      columns={columns()}
      onColumnsChange={setColumns}
      data={happinessData}
      getRowId={d => d.country}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
