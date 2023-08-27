import { useMemo, useState } from 'react'
import throttle from 'lodash-es/throttle'

import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'
import { animalData, Animal, animalColumns } from './data/animals'

import '@lightfin/datagrid/dist/styles.css'
import styles from './GlobalSearchDemo.module.css'

const filterData = throttle(
  (filter: string) =>
    filter
      ? animalData.filter(
          animal =>
            animal.animal.toLowerCase().indexOf(filter) !== -1 ||
            animal.type.toLowerCase().indexOf(filter) !== -1 ||
            animal.habitat.toLowerCase().indexOf(filter) !== -1 ||
            animal.diet.toLowerCase().indexOf(filter) !== -1
        )
      : animalData,
  30
)

export default function Demo({ theme }: DemoProps) {
  const [filter, setFilter] = useState('')

  const filteredData = useMemo(
    () => filterData(filter.toLowerCase()) || [],
    [filter]
  )

  return (
    <>
      <div className={styles.searchContainer}>
        <input
          type="search"
          placeholder="Search"
          className={styles.searchInput}
          onChange={e => setFilter(e.currentTarget.value)}
        />
      </div>
      <DataGrid<Animal>
        columns={animalColumns}
        data={filteredData}
        getRowId={d => d.animal}
        theme={theme === 'light' ? lightTheme : darkTheme}
      />
    </>
  )
}
