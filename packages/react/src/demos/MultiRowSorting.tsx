import { useState } from 'react'
import {
  Column,
  GroupedColumns,
  isColumnGroup,
  darkTheme,
  lightTheme,
} from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'

import { OpenLinkIcon } from 'src/components/Icons'
import { DemoProps } from './types'
import ignData from './data/igndata.json'

import '@lightfin/datagrid/dist/styles.css'

export interface Game {
  id: number
  scorePhrase: string
  title: string
  url: string
  platform: string
  score: number
  genre: string
  editorsChoice: 'Y' | 'N'
  releaseYear: number
  releaseMonth: number
  releaseDay: number
}

const gameColumns: GroupedColumns<Game, React.ReactNode> = [
  {
    key: 'url',
    header: null,
    getValue: d => (
      <a
        href={`https://ign.com${d.url}`}
        target="blank"
        title="Open game in new tab"
        style={{ color: 'var(--linkColor)' }}
      >
        <OpenLinkIcon style={{ height: 16 }} />
      </a>
    ),
    width: 50,
    pin: 'start',
  },
  {
    key: 'id',
    header: 'ID',
    getValue: d => d.id,
    width: 80,
  },
  {
    key: 'title',
    header: 'Title',
    getValue: d => d.title,
    width: 200,
  },
  {
    key: 'platform',
    header: 'Platform',
    getValue: d => d.platform,
    width: 160,
  },
  {
    key: 'score',
    header: 'Score',
    getValue: d => d.score,
    width: 80,
  },
  {
    key: 'scorePhrase',
    header: 'Score Phrase',
    getValue: d => d.scorePhrase,
  },
  {
    key: 'genre',
    header: 'Genre',
    getValue: d => d.genre,
    width: 120,
  },
  {
    key: 'editorsChoice',
    header: 'Pass',
    getValue: d => d.editorsChoice,
    width: 70,
  },
  {
    key: 'release',
    header: 'Release',
    getValue: d =>
      new Date(
        `${d.releaseYear}-${d.releaseMonth}-${d.releaseDay}`
      ).toLocaleDateString(),
    width: 120,
  },
]

const gameData = ignData as Game[]

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
