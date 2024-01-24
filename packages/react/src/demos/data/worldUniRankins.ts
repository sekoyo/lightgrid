import { GroupedColumns, SortDirection } from '@lightgrid/react'
import data from './world_uni_rankings.json'

export interface Ranking {
  rank: number
  name: string
  country: string
  studentNo: number
  studStaffRatio: number
  intStudents: number | null
  fmRatio: string
  overallScore: number
  teachingQual: number
  researchEnv: number
  researchQual: number
  industryImpact: number
  intOutlook: number
  year: number
}

export const rankingsData: Ranking[] = data as Ranking[]

export const worldUniRankingsColumns: GroupedColumns<Ranking> = [
  {
    key: 'rank',
    header: 'Rank',
    getValue: d => d.rank,
    width: 80,
    pin: 'start',
    sortable: true,
    sortDirection: SortDirection.Asc,
  },
  {
    key: 'year',
    header: 'Year',
    getValue: d => d.year,
    width: 80,
    sortable: true,
  },
  {
    key: 'name',
    header: 'Name',
    getValue: d => d.name,
    sortable: true,
    width: 220,
  },
  {
    key: 'country',
    header: 'Country',
    getValue: d => d.country,
    sortable: true,
    width: 160,
  },
  {
    key: 'noStudents',
    header: 'No. Student',
    getValue: d => d.studentNo,
    sortable: true,
  },
  {
    key: 'studStaffRatio',
    header: 'Student to Staff Ratio',
    getValue: d => d.studStaffRatio,
    sortable: true,
    width: 120,
  },
  {
    key: 'intStudents',
    header: 'International Students',
    getValue: d => d.intStudents,
    sortable: true,
    width: 126,
  },
  {
    key: 'fmRatio',
    header: 'F/M Ratio',
    getValue: d => d.fmRatio,
    sortable: true,
  },
  {
    key: 'overallScore',
    header: 'Overall Score',
    getValue: d => d.overallScore,
    sortable: true,
  },
  {
    key: 'teachingQual',
    header: 'Teaching Quality',
    getValue: d => d.teachingQual,
    sortable: true,
  },
  {
    key: 'reasearchEnv',
    header: 'Research Environment',
    getValue: d => d.researchEnv,
    sortable: true,
  },
  {
    key: 'industryImpact',
    header: 'Industry Impact',
    getValue: d => d.industryImpact,
    sortable: true,
  },
  {
    key: 'intOutlook',
    header: 'International Outlook',
    getValue: d => d.intOutlook,
    sortable: true,
  },
]
