import { useCallback, useEffect, useState } from 'react'
import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { Button } from '../components/Button'
import { DemoProps } from './types'
import { Person, peopleColumns, peopleData } from './data/people'

import '@lightfin/datagrid/dist/styles.css'
import styles from './InfinitePaginationDemo.module.css'

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
          peopleData.length > cursor + itemsPerPage
            ? cursor + itemsPerPage
            : undefined,
      })
    }, 800)
  })
}

export default function Demo({ theme }: DemoProps) {
  const [data, setData] = useState<Person[]>([])
  const [cursor, setCursor] = useState<number | undefined>(0)
  const [loading, setLoading] = useState(true)

  const fetchMore = useCallback(async (cursor?: number) => {
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
  }, [])

  useEffect(() => {
    fetchMore()
  }, [fetchMore])

  return (
    <>
      <DataGrid<Person>
        columns={peopleColumns}
        data={data}
        getRowId={d => d.id}
        theme={theme === 'light' ? lightTheme : darkTheme}
        loadingOverlay={
          data.length === 0 && (
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
            buttonType="secondary"
            disabled={loading || cursor === undefined}
            onClick={() => fetchMore(cursor)}
          >
            {loading ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      </div>
    </>
  )
}
