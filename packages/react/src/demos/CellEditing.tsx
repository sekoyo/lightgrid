import { useMemo, useState } from 'react'
import {
  GroupedColumns,
  darkTheme,
  lightTheme,
} from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { Input } from 'src/components/Input'
import { DemoProps } from './types'
import { GhostButton } from './GhostButton'

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

function InputEditor({
  type,
  value,
  onCommit,
}: {
  type?: React.InputHTMLAttributes<HTMLInputElement>['type']
  value: string
  onCommit: (newValue: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [tmpValue, setTmpValue] = useState(value)
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onCommit(tmpValue)
      setIsEditing(false)
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  return isEditing ? (
    <Input
      autoFocus
      type={type}
      value={tmpValue}
      onChange={e => setTmpValue(e.currentTarget.value)}
      onKeyDown={onKeyDown}
    />
  ) : (
    <GhostButton
      title="Click to edit"
      onDoubleClick={() => setIsEditing(true)}
    >
      {value}
    </GhostButton>
  )
}

export default function Demo({ theme }: DemoProps) {
  const [people, setPeople] = useState(data)

  const columns = useMemo<GroupedColumns<Person, React.ReactNode>>(
    () => [
      {
        key: 'firstname',
        header: 'First Name',
        getValue: d => d.firstname,
        cellComponent: ({ item, rowIndex }) => (
          <InputEditor
            value={item.firstname}
            onCommit={newValue =>
              setPeople(p => {
                p[rowIndex] = {
                  ...p[rowIndex],
                  firstname: newValue,
                }
                return p.slice()
              })
            }
          />
        ),
      },
      {
        key: 'lastname',
        header: 'Last Name',
        getValue: d => d.lastname,
        cellComponent: ({ item, rowIndex }) => (
          <InputEditor
            value={item.lastname}
            onCommit={newValue =>
              setPeople(p => {
                p[rowIndex] = {
                  ...p[rowIndex],
                  lastname: newValue,
                }
                return p.slice()
              })
            }
          />
        ),
      },
      {
        key: 'dob',
        header: 'Date of Birth',
        getValue: d =>
          d.dob ? new Date(d.dob).toLocaleDateString() : undefined,
        cellComponent: ({ item, rowIndex }) => (
          <InputEditor
            type="date"
            value={item.dob}
            onCommit={newValue =>
              setPeople(p => {
                p[rowIndex] = {
                  ...p[rowIndex],
                  dob: newValue,
                }
                return p.slice()
              })
            }
          />
        ),
      },
    ],
    []
  )

  return (
    <DataGrid<Person>
      columns={columns}
      data={people}
      getRowId={d => d.id}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
