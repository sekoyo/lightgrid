import { createMemo, createSignal } from 'solid-js'
import {
  darkTheme,
  lightTheme,
  GroupedColumns,
  RowState,
  GroupRow,
  isRowGroup,
  groupData,
  RowStateItem,
} from '@lightfin/datagrid'
import { DataGrid, N } from '@lightfin/solid-datagrid'
import { IconButton, RightArrowIcon } from 'src/components'
import { data, Medalist } from 'src/demo-data/winterOlympics'
import { DemoProps } from './types'

import '@lightfin/datagrid/dist/styles.css'

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
      <RightArrowIcon style={{ height: '10px' }} />
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

export default function Demo(props: DemoProps) {
  const [rowState, setRowState] = createSignal<RowState>({})

  const columns = createMemo<GroupedColumns<GroupRow | Medalist, N>>(
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
                  'align-items': 'center',
                  gap: '0.5em',
                  'margin-left': `${2 + 10 * item.depth}px`,
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

  const groupedData = createMemo(
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
      columns={columns()}
      data={groupedData()}
      getRowId={d => d.id}
      rowState={rowState()}
      setRowState={setRowState}
      theme={props.theme === 'light' ? lightTheme : darkTheme}
    />
  )
}
