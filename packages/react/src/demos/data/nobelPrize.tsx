import { GroupedColumns } from '@lightfin/datagrid'
import { IconButton } from 'src/components/IconButton'
import { DownArrowIcon } from 'src/components/Icons'
import rawData from './laureate.json'

export interface Affiliation {
  name: string
  city?: string
  country?: string
}

export interface Prize {
  year: string
  category: string
  share: string
  motivation: string
  affiliations: Affiliation[]
}

export interface Laureate {
  id: string
  firstname: string
  surname?: string
  born?: string
  died: string
  bornCountry?: string
  bornCountryCode?: string
  bornCity?: string
  diedCountry?: string
  diedCountryCode?: string
  diedCity?: string
  gender: string
  prizes: Prize[]
}

export const data: Laureate[] = rawData

export const columns: GroupedColumns<Laureate, React.ReactNode> = [
  {
    key: 'expand',
    header: '',
    getValue: () => null,
    cellComponent: ({ item, rowStateItem, setRowState }) => (
      <IconButton
        title="Expand row details"
        className="lg-cell-details-btn"
        onClick={() =>
          setRowState?.(s => ({
            ...s,
            [item.id]: { expanded: !rowStateItem?.expanded },
          }))
        }
      >
        <DownArrowIcon
          style={{
            height: '12px',
            transform: rowStateItem?.expanded
              ? undefined
              : 'rotate(270deg)',
          }}
        />
      </IconButton>
    ),
    width: 38,
    pin: 'start',
  },
  {
    key: 'firstname',
    header: 'Firstname',
    getValue: d => d.firstname,
    cellComponent: ({ item }) => (
      <div style={{ padding: '0 var(--lgCellHPadding)' }}>
        {item.firstname} ({item.prizes.length})
      </div>
    ),
    width: 180,
  },
  {
    key: 'surname',
    header: 'Last name',
    getValue: d => d.surname,
    width: 120,
  },
  {
    key: 'gender',
    header: 'Gender',
    getValue: d => d.gender,
    width: 85,
  },
  {
    key: 'born',
    header: 'Born',
    getValue: d => d.born,
    width: 120,
  },
  {
    key: 'birthCountry',
    header: 'Birth Country',
    getValue: d => d.bornCountry,
    width: 180,
  },
  {
    key: 'birthCity',
    header: 'Birth City',
    getValue: d => d.bornCity,
    width: 120,
  },
  {
    key: 'died',
    header: 'Died',
    getValue: d => d.died,
    width: 120,
  },
  {
    key: 'diedCountry',
    header: 'Died Country',
    getValue: d => d.diedCountry,
    width: 150,
  },
  {
    key: 'diedCity',
    header: 'Died City',
    getValue: d => d.diedCity,
    width: 130,
  },
]

export const prizeColumns: GroupedColumns<Prize, React.ReactNode> = [
  {
    key: 'year',
    header: 'Year',
    getValue: d => d.year,
    width: 100,
  },
  {
    key: 'category',
    header: 'Category',
    getValue: d => d.category,
    width: 140,
  },
  {
    key: 'share',
    header: 'Share',
    getValue: d => d.share,
    width: 90,
  },
  {
    key: 'motivation',
    header: 'Motivation',
    getValue: d => d.motivation,
    minWidth: 200,
  },
]
