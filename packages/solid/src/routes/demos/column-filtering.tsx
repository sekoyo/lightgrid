import { type JSX, createSignal, createEffect, untrack, onCleanup } from 'solid-js'
import debounce from 'lodash-es/debounce'
import {
  DerivedColumn,
  FilterFn,
  ItemId,
  darkTheme,
  lightTheme,
  GroupedColumns,
} from '@lightfin/datagrid'
import { DataGrid, type N } from '@lightfin/solid-datagrid'
import rangeSlider from 'range-slider-input'

import { Input } from 'src/components/Input'
import { Select } from 'src/components/Select'
import { OpenLinkIcon, SliderIcon } from 'src/components/Icons'
import { IconButton } from 'src/components/IconButton'
import ignData from 'src/demo-data/ign_data.json'
import { DemoProps } from './types'

import '@lightfin/datagrid/dist/styles.css'
import 'range-slider-input/dist/style.css'
import styles from './column-filtering.module.css'

// Our IGN data stops in 2016 so lets pretend it's current
const ignNowDate = new Date()
ignNowDate.setFullYear(2016)

const ignPlatforms = Array.from<string>(
  (ignData as any[]).reduce((set, item) => {
    set.add(item.platform)
    return set
  }, new Set())
).sort()

const ignScorePhrases = Array.from<string>(
  (ignData as any[]).reduce((set, item) => {
    set.add(item.scorePhrase)
    return set
  }, new Set())
).sort()

const ignGenres = Array.from<string>(
  (ignData as any[]).reduce((set, item) => {
    if (item.genre) {
      set.add(item.genre)
    }
    return set
  }, new Set())
).sort()

const editorsChoices = Array.from<string>(
  (ignData as any[]).reduce((set, item) => {
    set.add(item.editorsChoice)
    return set
  }, new Set())
).sort()

function TextFilter({
  type,
  onChange,
}: {
  type?: JSX.InputHTMLAttributes<HTMLInputElement>['type']
  onChange: (value: string) => void
}) {
  const [value, setValue] = createSignal('')
  return (
    <Input
      type={type}
      value={value()}
      style={{ padding: '0.25em' }}
      onInput={e => {
        setValue(e.currentTarget.value)
        onChange(e.currentTarget.value)
      }}
    />
  )
}

function SelectFilter({
  options,
  onChange,
}: {
  options: string[]
  onChange: (value: string) => void
}) {
  const [value, setValue] = createSignal('')
  return (
    <Select
      value={value()}
      style={{ padding: '0.25em' }}
      onChange={e => {
        setValue(e.currentTarget.value)
        onChange(e.currentTarget.value)
      }}
      options={[
        {
          value: '',
          label: 'Choose',
        },
      ].concat(
        options.map(v => ({
          value: v,
          label: v,
        }))
      )}
    />
  )
}

function RangeFilter({
  min,
  max,
  onChange,
}: {
  min: number
  max: number
  onChange: (value: [min: number, max: number]) => void
}) {
  let rangeSliderRef: HTMLDivElement | undefined
  const [value, setValue] = createSignal<[from: number, to: number]>([min, max])

  createEffect(() => {
    if (rangeSliderRef) {
      const rangeSliderElement = rangeSlider(rangeSliderRef, {
        min,
        max,
        value: untrack(value),
        onInput: (values: [from: number, to: number]) => {
          console.log('onInput', values)
          setValue(values)
          onChange(values)
        },
      })
      onCleanup(() => rangeSliderElement.removeGlobalEventListeners())
    }
  })

  return (
    <IconButton class={styles.popoverBtn} aria-labelledby="range filter popup">
      <SliderIcon style={{ height: '10px' }} />
      <div class={styles.popover}>
        <div ref={rangeSliderRef} />
      </div>
    </IconButton>
  )
}

export interface Game {
  id: number
  scorePhrase: string
  title: string
  url: string
  platform: string
  score: number
  genre: string
  editorsChoice: 'Y' | 'N'
  releaseYear: number
  releaseMonth: number
  releaseDay: number
}

const gameData = ignData as Game[]

const gameColumns: GroupedColumns<Game, JSX.Element> = [
  {
    key: 'url',
    header: null,
    getValue: d => (
      <a
        href={`https://ign.com${d.url}`}
        target="blank"
        title="Open game in new tab"
        style={{ color: 'var(--linkColor)' }}
      >
        <OpenLinkIcon style={{ height: '16px' }} />
      </a>
    ),
    width: 44,
    pin: 'start',
  },
  {
    key: 'id',
    header: 'ID',
    getValue: d => d.id,
    width: 80,
    filterComponent: onChange => <TextFilter type="number" onChange={onChange} />,
    filterFn: (item, filterValue) =>
      filterValue ? item.id === Number(filterValue) : true,
  },
  {
    key: 'title',
    header: 'Title',
    getValue: d => d.title,
    width: 200,
    filterComponent: onChange => <TextFilter type="search" onChange={onChange} />,
    filterFn: (item, value) => item.title.toLowerCase().includes(value.toLowerCase()),
  },
  {
    key: 'platform',
    header: 'Platform',
    getValue: d => d.platform,
    width: 160,
    filterComponent: onChange => (
      <SelectFilter options={ignPlatforms} onChange={onChange} />
    ),
    filterFn: (item, filterValue) => (filterValue ? item.platform === filterValue : true),
  },
  {
    key: 'score',
    header: 'Score',
    getValue: d => d.score,
    width: 80,
    filterComponent: onChange => <RangeFilter min={0} max={10} onChange={onChange} />,
    filterFn: (item, filterValues) =>
      filterValues?.length
        ? item.score >= filterValues[0] && item.score <= filterValues[1]
        : true,
  },
  {
    key: 'scorePhrase',
    header: 'Score Phrase',
    getValue: d => d.scorePhrase,
    filterComponent: onChange => (
      <SelectFilter options={ignScorePhrases} onChange={onChange} />
    ),
    filterFn: (item, filterValue) =>
      filterValue ? item.scorePhrase === filterValue : true,
  },
  {
    key: 'genre',
    header: 'Genre',
    getValue: d => d.genre,
    width: 120,
    filterComponent: onChange => <SelectFilter options={ignGenres} onChange={onChange} />,
    filterFn: (item, filterValue) => (filterValue ? item.genre === filterValue : true),
  },
  {
    key: 'editorsChoice',
    header: 'Pass',
    getValue: d => d.editorsChoice,
    width: 70,
    filterComponent: onChange => (
      <SelectFilter options={editorsChoices} onChange={onChange} />
    ),
    filterFn: (item, filterValue) =>
      filterValue ? item.editorsChoice === filterValue : true,
  },
  {
    key: 'release',
    header: 'Release',
    getValue: d =>
      new Date(`${d.releaseYear}-${d.releaseMonth}-${d.releaseDay}`).toLocaleDateString(),
    width: 120,
    filterComponent: onChange => (
      <SelectFilter
        options={['This year', 'Last year', 'This decade', 'All time']}
        onChange={onChange}
      />
    ),
    filterFn: (item, value: string) => {
      switch (value) {
        case 'This year':
          return item.releaseYear >= ignNowDate.getFullYear()
        case 'Last year':
          return item.releaseYear >= ignNowDate.getFullYear() - 1
        case 'This decade':
          return item.releaseYear >= ignNowDate.getFullYear() - 10
        default:
          return true
      }
    },
  },
]

export default function Demo(props: DemoProps) {
  const [data, setData] = createSignal(gameData)

  // We save the value and the column.filterFn so that whenever a filter
  // changes we can apply all the filter functions to each row/item.
  const filterState: Record<ItemId, { filterValue: any; filterFn: FilterFn<Game> }> = {}

  // Filter the data after a delay when a filter changes
  const filterData = debounce((column: DerivedColumn<Game, N>, filterValue: string) => {
    console.log('filterData', column, filterValue)
    const state = Object.assign(filterState, {
      [column.key]: {
        filterValue,
        filterFn: column.filterFn,
      },
    })

    setData(
      gameData.filter(item =>
        Object.values(state).every(
          ({ filterValue, filterFn }) => filterFn?.(item, filterValue) ?? true
        )
      )
    )
  }, 100)

  return (
    <DataGrid<Game>
      columns={gameColumns}
      data={data()}
      getRowId={d => d.id}
      theme={props.theme === 'light' ? lightTheme : darkTheme}
      onFiltersChange={filterData}
    />
  )
}
