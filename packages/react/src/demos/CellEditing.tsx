import { useMemo, useState } from 'react'
import {
  GroupedColumns,
  darkTheme,
  lightTheme,
} from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'

import '@lightfin/datagrid/dist/styles.css'

interface Person {
  id: string
  firstname: string
  lastname: string
  dob: string
}

const data: Person[] = [
  {
    id: 'sdfpop32r',
    firstname: 'Larry',
    lastname: 'Peanut',
    dob: '1948-11-23',
  },
]

function TextEditor({
  value,
  onCommit,
}: {
  value: string
  onCommit: (newValue: string) => void
}) {
  return null
}

export default function Demo({ theme }: DemoProps) {
  const [people, setPeople] = useState(data)

  const columns = useMemo<GroupedColumns<Person, React.ReactNode>>(
    () => [
      {
        key: 'firstname',
        header: 'First Name',
        getValue: d => d.firstname,
        cellComponent: ({ item }) => (
          <TextEditor
            value={item.firstname}
            onCommit={newValue => {
              setPeople(p => ({
                ...p,
                [item.id]: {
                  ...p[item.id],
                  firstname: newValue,
                },
              }))
            }}
          />
        ),
      },
      {
        key: 'lastname',
        header: 'Last Name',
        getValue: d => d.lastname,
      },
      {
        key: 'dob',
        header: 'Date of Birth',
        getValue: d => d.dob,
      },
    ],
    []
  )

  return (
    <DataGrid<Person>
      columns={columns}
      data={data}
      getRowId={d => d.id}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
