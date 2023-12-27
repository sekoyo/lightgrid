import { createMemo, createSignal } from 'solid-js'
import throttle from 'lodash-es/throttle'
import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/solid-datagrid'

import { Input } from 'src/components'
import { animalData, Animal, columns } from 'src/demo-data/animals'
import { DemoProps } from './types'

import '@lightfin/datagrid/dist/styles.css'
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
  const [filter, setFilter] = createSignal('')

  const filteredData = createMemo(() => filterData(filter().toLowerCase()) || [])

  return (
    <>
      <div class={styles.searchContainer}>
        <Input
          type="search"
          placeholder="Search"
          onChange={e => setFilter(e.currentTarget.value)}
        />
      </div>
      <DataGrid<Animal>
        columns={columns}
        data={filteredData()}
        getRowId={d => d.animal}
        theme={theme === 'light' ? lightTheme : darkTheme}
      />
    </>
  )
}
