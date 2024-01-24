import { useState } from 'react'
import { DataGrid, darkTheme, lightTheme } from '@lightgrid/react'
import { DemoProps } from './types'
import {
  rankingsData,
  worldUniRankingsColumns,
  Ranking,
} from './data/worldUniRankins'

import '@lightgrid/react/dist/style.css'
import './Virtualization.scss'

export default function Demo({ theme }: DemoProps) {
  const [columns, setColumns] = useState(worldUniRankingsColumns)
  return (
    <DataGrid<Ranking>
      columns={columns}
      onColumnsChange={setColumns}
      enableColumnResize
      headerRowHeight={80}
      data={rankingsData}
      getRowId={d => `${d.rank}${d.year}`}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
