import { useMemo, useState } from 'react'
import {
  DataGrid,
  darkTheme,
  lightTheme,
  GroupedColumns,
  RowState,
  GroupRow,
  isRowGroup,
  groupData,
  RowStateItem,
} from '@lightgrid/react'
import { RightArrowIcon } from 'src/components/Icons'
import { IconButton } from 'src/components/IconButton'
import { DemoProps } from './types'
import { data, Medalist } from './data/winterOlympics'

import '@lightgrid/react/dist/style.css'

// By default no groups will be expanded. You can
// expand to a certain depth by default, -1 means
// expand all groups.
const DEFAULT_EXPAND_DEPTH = 1

interface ExpandBtnProps {
  expanded?: boolean
  onExpandToggle: () => void
}

function ExpandBtn({ expanded, onExpandToggle }: ExpandBtnProps) {
  return (
    <IconButton
      title="Expand group"
      style={expanded ? { transform: 'rotate(90deg)' } : undefined}
      onClick={onExpandToggle}
    >
      <RightArrowIcon style={{ height: 10 }} />
    </IconButton>
  )
}

function renderGroupValue(item: GroupRow) {
  if (item.groupKey === 'athlete_sex') {
    if (item.value === 'W') {
      return 'Female'
    }
    if (item.value === 'M') {
      return 'Male'
    }
  }

  return item.value
}

function getExpandToggle(groupRow: GroupRow, rowState?: RowStateItem) {
  // If true, or if undefined and within
  // DEFAULT_EXPAND_DEPTH then collapse (false)
  if (
    rowState?.expanded === true ||
    (rowState?.expanded === undefined && groupRow.depth < DEFAULT_EXPAND_DEPTH)
  ) {
    return false
  }

  return true
}

export default function Demo({ theme }: DemoProps) {
  const [rowState, setRowState] = useState<RowState>({})

  const columns = useMemo<GroupedColumns<GroupRow | Medalist>>(
    () => [
      {
        key: 'group',
        header: 'Group',
        getValue: d => d.id,
        cellComponent: ({ item, rowStateItem, setRowState }) => {
          if (isRowGroup(item)) {
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em',
                  marginLeft: 2 + 10 * item.depth,
                }}
              >
                <ExpandBtn
                  expanded={rowStateItem?.expanded}
                  onExpandToggle={() => {
                    const expanded = getExpandToggle(item, rowStateItem)
                    setRowState?.(s => ({
                      ...s,
                      [item.id]: { expanded },
                    }))
                  }}
                />
                {renderGroupValue(item)} ({item.descendantCount})
              </div>
            )
          }
        },
      },
      {
        key: 'athlete_name',
        header: 'Athelete',
        getValue: d => !isRowGroup(d) && d.athlete_name,
      },
      {
        key: 'event',
        header: 'Event',
        getValue: d => !isRowGroup(d) && d.event,
      },
    ],
    []
  )

  const groupedData = useMemo(
    () =>
      groupData<Medalist>(
        data,
        // You can return a string, or a { key,
        // getValue} object e.g.
        // {
        //   key: 'country',
        //   getValue: item => item.country,
        // },
        ['country', 'medal_type', 'athlete_sex'],
        rowState,
        DEFAULT_EXPAND_DEPTH
      ),
    [rowState]
  )

  return (
    <DataGrid<GroupRow | Medalist>
      columns={columns}
      data={groupedData}
      getRowKey={d => d.id}
      rowState={rowState}
      setRowState={setRowState}
      theme={theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
