import { useState } from 'react'
import { RowState, darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'
import { data, columns, prizeColumns, Laureate, Prize } from './data/nobelPrize'

import '@lightfin/datagrid/dist/styles.css'

// You don't have to do this, we're just making the row details
// a perfect height for a datagrid with n prizes
const BORDER_SIZE = 2
const PADDING_SIZE = 16
const HEADER_ROW_SIZE = 40
const ROW_SIZE = 40

export default function Demo({ theme }: DemoProps) {
  const [rowState, setRowState] = useState<RowState>({})
  return (
    <DataGrid<Laureate>
      columns={columns}
      data={data}
      getRowId={d => d.id}
      // Required: tell the datagrid this row has row details
      getRowMeta={item => ({
        height: ROW_SIZE,
        hasDetails: Boolean(item.prizes.length),
      })}
      // Optional: specify details height
      getRowDetailsMeta={item => ({
        height:
          BORDER_SIZE +
          PADDING_SIZE * 2 +
          HEADER_ROW_SIZE +
          item.prizes.length * ROW_SIZE,
      })}
      renderRowDetails={item => (
        <div style={{ height: '100%', width: '100%', padding: '1em' }}>
          <DataGrid<Prize>
            data={item.prizes || []}
            getRowId={d => item.id + d.year}
            columns={prizeColumns}
          />
        </div>
      )}
      rowState={rowState}
      setRowState={setRowState}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
