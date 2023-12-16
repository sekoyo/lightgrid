import { useState } from 'react'
import { RowState, darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'
import {
  data,
  columns,
  prizeColumns,
  Laureate,
  Prize,
} from './data/nobelPrize'

import '@lightfin/datagrid/dist/styles.css'

export default function Demo({ theme }: DemoProps) {
  const [rowState, setRowState] = useState<RowState>({})
  return (
    <DataGrid<Laureate>
      columns={columns}
      data={data}
      getRowId={d => d.id}
      // Required: tell the datagrid this row has row details
      getRowMeta={item => ({
        height: 40,
        hasDetails: Boolean(item.prizes.length),
      })}
      // Optional: specify details height
      getRowDetailsMeta={() => ({
        height: 140,
      })}
      renderRowDetails={item => (
        <DataGrid<Prize>
          data={item.prizes || []}
          getRowId={d => item.id + d.year}
          columns={prizeColumns}
          style={{ padding: '1em' }}
        />
      )}
      rowState={rowState}
      setRowState={setRowState}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
