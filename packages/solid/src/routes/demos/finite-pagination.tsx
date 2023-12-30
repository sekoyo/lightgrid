import { type JSX, createEffect, createSignal, onCleanup } from 'solid-js'
import { cancelable } from 'cancelable-promise'
import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/solid-datagrid'

import { Button } from 'src/components/Button'
import { Input } from 'src/components/Input'
import { DemoProps } from './types'
import { Person, peopleColumns, peopleData } from 'src/demo-data/people'

import '@lightfin/datagrid/dist/styles.css'
import styles from './finite-pagination.module.css'

// Our pretend server api
const itemsPerPage = 50
async function fetchData(fromIndex = 0): Promise<{ data: Person[]; pageCount: number }> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        data: peopleData.slice(fromIndex, fromIndex + itemsPerPage),
        pageCount: Math.ceil(peopleData.length / itemsPerPage),
      })
    }, 800)
  })
}

export default function Demo(props: DemoProps) {
  const [page, setPage] = createSignal(1)
  const [data, setData] = createSignal<Person[]>([])
  const [pageCount, setPageCount] = createSignal(0)
  const clampPage = (p: number) => Math.max(1, Math.min(p, pageCount()))
  const [loading, setLoading] = createSignal(true)

  const fetchPaginatedData = (fromIndex?: number) => {
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
  }

  createEffect(() => {
    const fromIdx = (page() - 1) * itemsPerPage
    const promise = fetchPaginatedData(fromIdx)
    onCleanup(() => {
      // If page changes while fetching, cancel in favour of new request
      // A real API would use something like https://developer.mozilla.org/en-US/docs/Web/API/AbortController
      promise.cancel()
    })
  })

  const gotoPrevPage = () => {
    setPage(p => clampPage(p - 1))
  }

  const gotoNextPage = () => {
    setPage(p => clampPage(p + 1))
  }

  const onPageChange: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event> = e => {
    const pageNum = Number(e.currentTarget.value)
    if (!isNaN(pageNum)) {
      setPage(clampPage(pageNum))
    }
  }

  return (
    <>
      <DataGrid<Person>
        columns={peopleColumns}
        data={data()}
        getRowId={d => d.id}
        theme={props.theme === 'light' ? lightTheme : darkTheme}
        loadingOverlay={
          loading() && (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                background:
                  props.theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
              }}
            >
              Loading, please wait...
            </div>
          )
        }
      />
      <div class={styles.pageControlContainer}>
        <div class={styles.pageControls}>
          <Button variant="secondary" disabled={page() === 1} onClick={gotoPrevPage}>
            Prev
          </Button>
          <Input type="number" value={page()} onChange={onPageChange} />
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
