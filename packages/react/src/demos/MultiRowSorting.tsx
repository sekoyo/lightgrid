import { useState } from 'react'
import { Column, darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'
import { gameColumns, gameData, type Game } from './data/IGNGames'

import '@lightfin/datagrid/dist/styles.css'
import { isColumnGroup } from '@lightfin/datagrid'

const sortableColumns = gameColumns.map(column => {
  if (!isColumnGroup(column)) {
    return {
      ...column,
      sortable: true,
    } as Column<Game, React.ReactNode>
  }
  return column
})

export default function Demo({ theme }: DemoProps) {
  const [columns, setColumns] = useState(sortableColumns)
  return (
    <DataGrid<Game>
      columns={columns}
      onColumnsChange={setColumns}
      data={gameData}
      multiSort={true}
      getRowId={d => d.id}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
