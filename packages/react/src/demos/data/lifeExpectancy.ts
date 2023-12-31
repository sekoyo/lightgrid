import { GroupedColumns, ValueSource } from '@lightgrid/react'
import rawData from './life_expectancy.json'

export interface LifeExpectancy {
  country: string
  year: number
  status: string
  lifeExpectancy: number
  adultMortality: number
  infantDeaths: number
  alcohol: number
  percentageExpenditure: number
  hepatitisB: number
  measles: number
  BMI: number
  underFiveDeaths: number
  polio: number
  totalExpenditure: number
  diphtheria: number
  HIV: {
    AIDS: number
  }
  GDP: number
  population: number
  'thinness1-19years': number
  'thinness5-9Years': number
  incomeCompositionOfResources: number
  schooling: number
}

export const data: LifeExpectancy[] = rawData

export const columns: GroupedColumns<LifeExpectancy> = [
  {
    key: 'country',
    header: 'Country',
    getValue: d => d.country,
    width: 160,
    pin: 'start',
  },
  {
    key: 'year',
    header: 'Year',
    getValue: d => d.year,
  },
  {
    key: 'gdp',
    header: 'GDP',
    getValue: (d, source) =>
      source === ValueSource.Cell ? d.GDP.toFixed(2) : d.GDP,
  },
  {
    key: 'status',
    header: 'Status',
    getValue: d => d.status,
    width: 120,
  },
  {
    key: 'lifeExpectancy',
    header: 'Life Expectancy',
    getValue: d => d.lifeExpectancy,
    pin: 'end',
  },
  {
    key: 'adultMortality',
    header: 'Adult Mortality',
    getValue: d => d.adultMortality,
  },
  {
    key: 'infantDeaths',
    header: 'Infant Deaths',
    getValue: d => d.infantDeaths,
  },
  {
    key: 'alcohol',
    header: 'Alcohol',
    getValue: d => d.alcohol,
  },
  {
    key: 'percentageExpenditure',
    header: '% Expenditure',
    getValue: (d, source) =>
      source === ValueSource.Cell
        ? d.percentageExpenditure.toFixed(2)
        : d.percentageExpenditure,
  },
  {
    key: 'hepatitisB',
    header: 'Hepatitis B',
    getValue: d => d.hepatitisB,
  },
  {
    key: 'measles',
    header: 'Measles',
    getValue: d => d.measles,
  },
]
