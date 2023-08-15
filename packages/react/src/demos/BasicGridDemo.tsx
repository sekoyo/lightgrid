import { GroupedColumns } from '@lightfin/datagrid'
import { DataGrid } from '@lightfin/react-datagrid'
import { animalData, Animal } from './data/animals'

import '@lightfin/datagrid/dist/styles.css'

const columns: GroupedColumns<Animal, React.ReactNode> = [
  {
    key: 'animal',
    header: 'Animal',
    getValue: d => d.animal,
  },
  {
    key: 'type',
    header: 'Type',
    getValue: d => d.type,
  },
  {
    key: 'habitat',
    header: 'Habitat',
    getValue: d => d.habitat,
  },
  {
    key: 'diet',
    header: 'Diet',
    getValue: d => d.diet,
  },
  {
    key: 'legs',
    header: 'Legs',
    getValue: d => d.legs,
  },
]

export default function Demo() {
  return (
    <DataGrid<Animal>
      columns={columns}
      data={animalData}
      getRowId={d => d.animal}
    />
  )
}
