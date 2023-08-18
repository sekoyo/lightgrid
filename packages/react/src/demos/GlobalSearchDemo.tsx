import { darkTheme, lightTheme } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { DemoProps } from './types'
import { animalData, Animal, animalColumns } from './data/animals'

import styles from './GlobalSearchDemo.module.css'
import '@lightfin/datagrid/dist/styles.css'

export default function Demo({ theme }: DemoProps) {
  return (
    <>
      <input
        type="search"
        placeholder="Search"
        className={styles.searchInput}
      />
      <DataGrid<Animal>
        columns={animalColumns}
        data={animalData}
        getRowId={d => d.animal}
        theme={theme === 'light' ? lightTheme : darkTheme}
      />
    </>
  )
}
