import { GroupedColumns, SortDirection } from '@lightfin/datagrid'
import happiness from './happiness.json'

export interface HappinessEntry {
  country: string
  happinessIndex: number
  globalRank: number
  availableData: string
}

export const happinessData: HappinessEntry[] = happiness

export const happinessColumns: GroupedColumns<HappinessEntry, React.ReactNode> = [
  {
    key: 'country',
    header: 'Country',
    getValue: d => d.country,
    sortable: true,
  },
  {
    key: 'index',
    header: 'Index',
    getValue: d => d.happinessIndex,
    sortable: true,
  },
  {
    key: 'globalRank',
    header: 'Global Rank',
    getValue: d => d.globalRank,
    sortable: true,
    sortDirection: SortDirection.Asc,
  },
  {
    key: 'availableData',
    header: 'Available Data',
    getValue: d => d.availableData,
    sortable: true,
  },
]
