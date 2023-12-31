import { useCallback, useEffect, useState } from 'react'
import { cancelable } from 'cancelable-promise'
import { DataGrid, darkTheme, lightTheme } from '@lightgrid/react'

import { Button } from 'src/components/Button'
import { Input } from 'src/components/Input'
import { DemoProps } from './types'
import { Person, peopleColumns, peopleData } from './data/people'

import '@lightgrid/react/dist/style.css'
import styles from './FinitePagination.module.css'

// Our pretend server api
const itemsPerPage = 50
async function fetchData(
  fromIndex = 0
): Promise<{ data: Person[]; pageCount: number }> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        data: peopleData.slice(fromIndex, fromIndex + itemsPerPage),
        pageCount: Math.ceil(peopleData.length / itemsPerPage),
      })
    }, 800)
  })
}

export default function Demo({ theme }: DemoProps) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Person[]>([])
  const [pageCount, setPageCount] = useState(0)
  const clampPage = (p: number) => Math.max(1, Math.min(p, pageCount))
  const [loading, setLoading] = useState(true)

  const fetchPaginatedData = useCallback((fromIndex?: number) => {
    const p = cancelable<void>(
      new Promise((resolve, reject) => {
        setLoading(true)
        fetchData(fromIndex)
          .then(res => {
            if (!p.isCanceled()) {
              setData(res.data)
              setPageCount(res.pageCount)
              setLoading(false)
            }
            resolve()
          })
          .catch(err => {
            console.error(err)
            setLoading(false)
            reject(err)
          })
      })
    )
    return p
  }, [])

  useEffect(() => {
    const fromIdx = (page - 1) * itemsPerPage
    const promise = fetchPaginatedData(fromIdx)
    return () => {
      // If page changes while fetching, cancel in favour of new request
      // A real API would use something like https://developer.mozilla.org/en-US/docs/Web/API/AbortController
      promise.cancel()
    }
  }, [page, fetchPaginatedData])

  const gotoPrevPage = () => {
    setPage(p => clampPage(p - 1))
  }

  const gotoNextPage = () => {
    setPage(p => clampPage(p + 1))
  }

  const onPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageNum = Number(e.currentTarget.value)
    if (!isNaN(pageNum)) {
      setPage(clampPage(pageNum))
    }
  }

  return (
    <>
      <DataGrid<Person>
        columns={peopleColumns}
        data={data}
        getRowId={d => d.id}
        theme={theme === 'light' ? lightTheme : darkTheme}
        loadingOverlay={
          loading && (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  theme === 'light'
                    ? 'rgba(255,255,255,0.8)'
                    : 'rgba(0,0,0,0.7)',
              }}
            >
              Loading, please wait...
            </div>
          )
        }
      />
      <div className={styles.pageControlContainer}>
        <div className={styles.pageControls}>
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={gotoPrevPage}
          >
            Prev
          </Button>
          <Input type="number" value={page} onChange={onPageChange} />
          <Button
            variant="secondary"
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
