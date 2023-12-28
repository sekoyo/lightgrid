import { type JSX, createMemo, createSignal } from 'solid-js'
import { GroupedColumns, darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid, N } from '@lightfin/solid-datagrid'
import { Input, GhostButton } from 'src/components'
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

function InputEditor({
  type,
  value,
  onCommit,
}: {
  type?: JSX.InputHTMLAttributes<HTMLInputElement>['type']
  value: string
  onCommit: (newValue: string) => void
}) {
  const [isEditing, setIsEditing] = createSignal(false)
  const [tmpValue, setTmpValue] = createSignal(value)

  return isEditing() ? (
    <Input
      auto-focus
      type={type}
      value={tmpValue()}
      onChange={e => setTmpValue(e.currentTarget.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onCommit(tmpValue())
          setIsEditing(false)
        } else if (e.key === 'Escape') {
          setTmpValue(value)
          setIsEditing(false)
        }
      }}
      onBlur={() => {
        onCommit(tmpValue())
        setIsEditing(false)
      }}
    />
  ) : (
    <GhostButton
      title="Click to edit"
      onDblClick={() => setIsEditing(true)}
      onFocus={() => {
        setIsEditing(true)
      }}
    >
      {value}
    </GhostButton>
  )
}

export default function Demo({ theme }: DemoProps) {
  const [people, setPeople] = createSignal(data)

  const columns = createMemo<GroupedColumns<Person, N>>(
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
        getValue: d => (d.dob ? new Date(d.dob).toLocaleDateString() : undefined),
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
      columns={columns()}
      data={people()}
      getRowId={d => d.id}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
