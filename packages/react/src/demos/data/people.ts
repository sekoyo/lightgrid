import { GroupedColumns } from '@lightgrid/react'
import data from './people_data.json'

export interface Person {
  id: number
  firstName: string
  lastName: string
  email: string
  gender: string
  ipAddress: string
}

export const peopleData: Person[] = data

export const peopleColumns: GroupedColumns<Person> = [
  {
    key: 'id',
    header: 'ID',
    getValue: d => d.id,
    width: 70,
  },
  {
    key: 'firstName',
    header: 'First Name',
    getValue: d => d.firstName,
  },
  {
    key: 'lastName',
    header: 'Last Name',
    getValue: d => d.lastName,
  },
  {
    key: 'email',
    header: 'Email',
    getValue: d => d.email,
  },
  {
    key: 'gender',
    header: 'Gender',
    getValue: d => d.gender,
  },
  {
    key: 'ipAddress',
    header: 'IP Address',
    getValue: d => d.ipAddress,
  },
]
