import { GroupedColumns } from '@lightfin/datagrid'

export interface Animal {
  animal: string
  type: string
  habitat: string
  diet: string
  legs: number
}

export const animalData: Animal[] = [
  {
    animal: 'Dog',
    type: 'Mammal',
    habitat: 'Terrestrial',
    diet: 'Omnivore',
    legs: 4,
  },
  {
    animal: 'Cat',
    type: 'Mammal',
    habitat: 'Terrestrial',
    diet: 'Carnivore',
    legs: 4,
  },
  {
    animal: 'Eagle',
    type: 'Bird',
    habitat: 'Aerial',
    diet: 'Carnivore',
    legs: 2,
  },
  {
    animal: 'Turtle',
    type: 'Reptile',
    habitat: 'Aquatic',
    diet: 'Herbivore',
    legs: 4,
  },
  {
    animal: 'Dolphin',
    type: 'Mammal',
    habitat: 'Aquatic',
    diet: 'Carnivore',
    legs: 0,
  },
  {
    animal: 'Frog',
    type: 'Amphibian',
    habitat: 'Aquatic',
    diet: 'Carnivore',
    legs: 4,
  },
  {
    animal: 'Snake',
    type: 'Reptile',
    habitat: 'Terrestrial',
    diet: 'Carnivore',
    legs: 0,
  },
  {
    animal: 'Elephant',
    type: 'Mammal',
    habitat: 'Terrestrial',
    diet: 'Herbivore',
    legs: 4,
  },
]

export const columns: GroupedColumns<Animal, React.ReactNode> = [
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
