import { createEffect, createSignal } from 'solid-js'
import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/solid-datagrid'

import { Button } from 'src/components'
import { Person, peopleColumns, peopleData } from 'src/demo-data/people'
import { DemoProps } from './types'

import '@lightfin/datagrid/dist/styles.css'
import styles from './infinite-pagination.module.css'

const itemsPerPage = 50

// Our pretend server api
async function fetchData(
  cursor = 0
): Promise<{ data: Person[]; nextCursor: number | undefined }> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        data: peopleData.slice(cursor, cursor + itemsPerPage),
        nextCursor:
          peopleData.length > cursor + itemsPerPage ? cursor + itemsPerPage : undefined,
      })
    }, 800)
  })
}

export default function Demo(props: DemoProps) {
  const [data, setData] = createSignal<Person[]>([])
  const [cursor, setCursor] = createSignal<number | undefined>(0)
  const [loading, setLoading] = createSignal(true)

  const fetchMore = async (cursor?: number) => {
    try {
      setLoading(true)
      const res = await fetchData(cursor)
      setData(d => d.concat(res.data))
      setCursor(res.nextCursor)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  createEffect(() => {
    fetchMore()
  })

  return (
    <>
      <DataGrid<Person>
        columns={peopleColumns}
        data={data()}
        getRowId={d => d.id}
        theme={props.theme === 'light' ? lightTheme : darkTheme}
        loadingOverlay={
          data().length === 0 && (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                background:
                  theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
              }}
            >
              Loading, please wait...
            </div>
          )
        }
      />
      <div class={styles.pageControlContainer}>
        <div class={styles.pageControls}>
          <Button
            variant="secondary"
            disabled={loading() || cursor() === undefined}
            onClick={() => fetchMore(cursor())}
          >
            {loading() ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      </div>
    </>
  )
}
