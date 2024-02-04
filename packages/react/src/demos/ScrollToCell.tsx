import { useRef } from 'react'
import { DataGrid, GridApi, darkTheme, lightTheme } from '@lightgrid/react'

import { DemoProps } from './types'
import { Person, peopleColumns, peopleData } from './data/people'

import '@lightgrid/react/dist/style.css'
import { Button } from 'src/components/Button'

export default function Demo({ theme }: DemoProps) {
  const gridApi = useRef<GridApi>()

  const scrollToBillieCraister = () => {
    const item = peopleData.find(
      p => p.firstName === 'Billie' && p.lastName === 'Craister'
    )
    if (gridApi.current && item) {
      gridApi.current.scrollTo({ rowKey: item.id })
    }
  }

  return (
    <>
      <p>
        <Button onClick={scrollToBillieCraister}>
          Scroll to Billie Craister row
        </Button>
      </p>
      <DataGrid<Person>
        columns={peopleColumns}
        data={peopleData}
        getRowKey={d => d.id}
        theme={theme === 'light' ? lightTheme : darkTheme}
        gridApi={gridApi}
      />
    </>
  )
}
