import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Person, peopleColumns, peopleData } from './data/people'

import '@lightfin/datagrid/dist/styles.css'
import styles from './FinitePaginationDemo.module.css'
import { useEffect, useState } from 'react'

const itemsPerPage = 50
const pageCount = Math.ceil(peopleData.length / itemsPerPage)

export default function Demo({ theme }: DemoProps) {
  const [page, setPage] = useState(1)
  const [paginatedData, setPaginatedData] = useState(() =>
    peopleData.slice(0, itemsPerPage)
  )
  const clampPage = (p: number) => Math.max(1, Math.min(p, pageCount))

  useEffect(() => {
    const fromIdx = (page - 1) * itemsPerPage
    const toIdx = fromIdx + itemsPerPage
    setPaginatedData(peopleData.slice(fromIdx, toIdx))
  }, [page])

  const gotoPrevPage = () => {
    setPage(p => clampPage(p - 1))
  }

  const gotoNextPage = () => {
    setPage(p => clampPage(p + 1))
  }

  const onPageChange: React.ChangeEventHandler<
    HTMLInputElement
  > = e => {
    const pageNum = Number(e.currentTarget.value)
    if (!isNaN(pageNum)) {
      setPage(clampPage(pageNum))
    }
  }

  return (
    <>
      <DataGrid<Person>
        columns={peopleColumns}
        data={paginatedData}
        getRowId={d => d.id}
        theme={theme === 'light' ? lightTheme : darkTheme}
      />
      <div className={styles.pageControlContainer}>
        <div className={styles.pageControls}>
          <Button
            buttonType="secondary"
            disabled={page === 1}
            onClick={gotoPrevPage}
          >
            Prev
          </Button>
          <Input type="number" value={page} onChange={onPageChange} />
          <Button
            buttonType="secondary"
            disabled={page === pageCount}
            onClick={gotoNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  )
}
