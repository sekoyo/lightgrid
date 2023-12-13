import rawData from './beijing_2022_winter_olympic_medals.json'

export type Medalist = {
  id: number
  medal_type: string
  medal_code: number
  medal_date: string
  athlete_short_name: string
  athlete_name: string
  athlete_sex: string
  event: string
  country: string
  country_code: string
  discipline: string
  discipline_code: string
}

export const data: Medalist[] = rawData
