import { useCallback, useEffect, useState } from 'react'
import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'

import { Button } from 'src/components/Button'
import { DemoProps } from './types'
import { animalData, columns, Animal } from './data/animals'

import '@lightfin/datagrid/dist/styles.css'

export default function Demo({ theme }: DemoProps) {
  const [data, setData] = useState<Animal[]>([])

  const fakeFetchData = useCallback(() => {
    // Simulate fetching data with a delay
    const interval = setTimeout(() => {
      setData(animalData)
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  useEffect(fakeFetchData, [fakeFetchData])

  return (
    <>
      <Button
        style={{ marginBottom: '0.5em' }}
        disabled={!data.length}
        onClick={() => {
          setData([])
          fakeFetchData()
        }}
      >
        Simulate data loading
      </Button>
      <DataGrid<Animal>
        columns={columns}
        data={data}
        getRowId={d => d.animal}
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
    </>
  )
}
