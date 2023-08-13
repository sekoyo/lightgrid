import { useState } from 'react'
import {
  CellComponentProps,
  GroupedColumns,
  ItemId,
  OnRowStateChange,
  RowState,
  RowStateItem,
} from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'

import '@lightfin/datagrid/dist/styles.css'

type R = React.ReactNode

interface Details {
  name: string
  dob: string
}

interface Item {
  id: ItemId
  details: Details
}

const getValue = (item: Item) => {
  return item.id
}

const today = new Date()

let keyN = 0
const middleCols = new Array(100).fill(0).map(() => ({
  key: `mid${keyN++}`,
  width: 100,
  getValue,
}))

function CustomCell({ item, column }: CellComponentProps<Item, R>) {
  return <strong>{column.getValue(item)}</strong>
}

export default function Demo() {
  const [data, setData] = useState(() => {
    const a: Item[] = new Array(1000).fill(0).map((_, i) => ({
      id: i,
      details: {
        name: 'Bobby Longshaft',
        dob: '2023-01-05',
      },
    }))

    return a
  })
  const [pinnedTopData, setPinnedTopData] = useState(() => {
    const a: Item[] = new Array(2).fill(0).map((_, i) => ({
      id: i + 2000,
      details: {
        name: 'Bobby Longshaft',
        dob: '2023-01-05',
      },
    }))

    return a
  })
  const [pinnedBottomData, setPinnedBottomData] = useState(() => {
    const a: Item[] = new Array(3).fill(0).map((_, i) => ({
      id: i + 3000,
      details: {
        name: 'Bobby Longshaft',
        dob: '2023-01-05',
      },
    }))

    return a
  })
  const [rowState, setRowState] = useState<RowState>({})
  const [cellSelectionEnabled, setCellSelectionEnabled] =
    useState(true)

  const onRowStateChange: OnRowStateChange = (
    itemId: ItemId,
    item: RowStateItem
  ) => {
    setRowState(s => ({
      ...s,
      [itemId]: item,
    }))
  }

  function changeData() {
    setData(d => {
      const x = d.slice(0)
      x[0].id = 9999
      return x
    })
  }

  const [columns, setColumns] = useState<GroupedColumns<Item, R>>(
    () => [
      {
        key: 'b',
        header: 'B',
        pin: 'end',
        children: [
          {
            key: 'c',
            header: 'C',
            width: 80,
            getValue,
          },
          {
            key: 'd',
            header: 'D',
            children: [
              {
                key: 'x',
                header: 'X',
                width: '0.5fr',
                getValue,
              },
              {
                key: 'y',
                header: 'Y',
                width: '0.5fr',
                getValue,
              },
            ],
          },
          {
            key: 'e',
            header: 'E',
            width: '120px',
            getValue,
            pin: 'start',
            sortable: true,
          },
        ],
      },
      ...middleCols,
      {
        key: 'f',
        header: 'F',
        pin: 'start',
        width: '1fr',
        sortable: true,
        getValue: () => today.getFullYear(),
        cellComponent: props => (
          <CustomCell column={props.column} item={props.item} />
        ),
      },
    ]
  )

  return (
    <div
      style={{
        width: '100%',
        flex: 1,
        padding: '1em',
      }}
    >
      <div style={{ marginBottom: '1em' }}>
        <button onClick={changeData}>Change data</button>
      </div>
      <DataGrid<Item>
        columns={columns}
        onColumnsChange={setColumns}
        rowState={rowState}
        onRowStateChange={onRowStateChange}
        getRowId={item => item.id}
        getRowMeta={item => ({
          height: 30,
          hasDetails: Boolean(item.details),
        })}
        getRowDetailsMeta={() => ({
          height: 140,
        })}
        renderRowDetails={item => (
          <div>
            <div>name: {item.details.name}</div>
            <div>dob: {item.details.dob}</div>
          </div>
        )}
        data={data}
        onDataChange={setData}
        pinnedTopData={pinnedTopData}
        pinnedBottomData={pinnedBottomData}
        enableCellSelection={cellSelectionEnabled}
        enableColumnResize
        enableColumnReorder
        // direction="rtl"
      />
      <button onClick={() => setCellSelectionEnabled(f => !f)}>
        {cellSelectionEnabled ? 'Disable' : 'Enable'} cell selection
      </button>
    </div>
  )
}
