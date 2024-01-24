import { useMemo, useState } from 'react'
import { DataGrid, darkTheme, lightTheme, throttle } from '@lightgrid/react'

import { Input } from 'src/components/Input'
import { DemoProps } from './types'
import { animalData, Animal, columns } from './data/animals'

import '@lightgrid/react/dist/style.css'
import styles from './GlobalFiltering.module.css'

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
        <Input
          type="search"
          placeholder="Search"
          onChange={e => setFilter(e.currentTarget.value)}
        />
      </div>
      <DataGrid<Animal>
        columns={columns}
        data={filteredData}
        getRowId={d => d.animal}
        theme={theme === 'light' ? lightTheme : darkTheme}
      />
    </>
  )
}
