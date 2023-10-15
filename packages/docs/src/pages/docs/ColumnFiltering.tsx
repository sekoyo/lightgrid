import {
  Code,
  H1,
  P,
  PageButton,
  HGroup,
  Section,
  A,
  H3,
  H2,
  CodeBlock,
} from 'src/components/DocTypography'
import { useFrameworkTabs } from 'src/components/FrameworkTabContext'
import { Tabs } from 'src/components/Tabs'
import { Demo } from 'src/components/Demo'

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs()

  return (
    <div>
      <H1>Column Filtering</H1>
      <Section>
        <P>
          If you want to search across all columns see{' '}
          <A href="/docs/guides/global-search">Global Search</A>
        </P>
        <H2>Column props</H2>
        <P>
          You can implement filtering by customizing the column header. There are two
          props which control filtering:
        </P>
        <H3>filterComponent</H3>
        <P>
          A callback which is passed an <Code>onChange</Code> handler and should return
          the column filtering component. The component should define the filter value
          locally (useState/setState) and also call <Code>onChange</Code> at the same time
          as updating local state.
        </P>
        <P>For example:</P>
        <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
          {[
            {
              id: 'react',
              label: 'React',
              component: (
                <CodeBlock lang="typescript">{`
                // filterComponent: onChange => (
                //   <TextFilter onChange={onChange} />
                // ),
                function TextFilter({ onChange }: { onChange: (value: string) => void }) {
                  const [value, setValue] = useState('')
                  return (
                    <Input
                      type="search"
                      value={value}
                      onChange={e => {
                        setValue(e.currentTarget.value)
                        onChange(e.currentTarget.value)
                      }}
                    />
                  )
                }
              `}</CodeBlock>
              ),
            },
            {
              id: 'solid',
              label: 'Solid',
              component: (
                <CodeBlock lang="typescript">{`
                // filterComponent: onChange => (
                //   <TextFilter onChange={onChange} />
                // ),
                function TextFilter({ onChange }: { onChange: (value: string) => void }) {
                  const [value, setValue] = createSignal('')
                  return (
                    <Input
                      type="search"
                      value={value()}
                      onChange={e => {
                        setValue(e.currentTarget.value)
                        onChange(e.currentTarget.value)
                      }}
                    />
                  )
                }
              `}</CodeBlock>
              ),
            },
          ]}
        </Tabs>
        <H3>filterFn</H3>
        <P>
          A function used to filter data by this column's filter value. It's passed{' '}
          <Code>(item, filerValue)</Code>, where item is a row/item of data and value is
          the filter value for this column. Returning <Code>false</Code> means filter the
          item out of the datagrid.
        </P>
        <P>For example:</P>
        <CodeBlock lang="typescript">{`
          filterFn: (item, filterValue) =>
            item.title.toLowerCase().includes(filterValue.toLowerCase())
        `}</CodeBlock>
        <H2>DataGrid props</H2>
        <P>
          Finally, there are two props on the DataGrid, one which must be implemented.
        </P>
        <H3>onFilterChange (required for filtering)</H3>
        <P>
          Called each time a column filter calls <Code>onChange</Code>. This is the
          callback where you filter data.
        </P>
        <P>
          Typically you'll want to add a small debounce for that filters where the user
          types or adjusts a silder.
        </P>
        <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
          {[
            {
              id: 'react',
              label: 'React',
              component: (
                <CodeBlock lang="typescript">{`
                // Save the filterValues and functions in an object
                const filterState = useRef<
                  Record<ItemId, { filterValue: any; filterFn: FilterFn<Game> }>
                >({})
                
                // Filter the data after a delay when a filter changes
                const filterData = useMemo(
                  () =>
                    debounce(
                      (column: DerivedColumn<Game, N>, filterValue: string) => {
                        const state = Object.assign(filterState.current, {
                          [column.key]: {
                            filterValue,
                            filterFn: column.filterFn,
                          },
                        })
                
                        setData(
                          gameData.filter(item =>
                            Object.values(state).every(
                              ({ filterValue, filterFn }) =>
                                filterFn?.(item, filterValue) ?? true
                            )
                          )
                        )
                      },
                      100
                    ),
                  []
                )

                return (
                  <DataGrid
                    // ...
                    onFiltersChange={filterData}
                  />
                )
              `}</CodeBlock>
              ),
            },
            {
              id: 'solid',
              label: 'Solid',
              component: (
                <CodeBlock lang="typescript">{`
                // Save the filterValues and functions in an object
                const filterState: Record<ItemId, { filterValue: any; filterFn: FilterFn<Game> }> = {}
                
                // Filter the data after a delay when a filter changes
                const filterData = createMemo(() =>
                  debounce(
                    (column: DerivedColumn<Game, N>, filterValue: string) => {
                      const state = Object.assign(filterState.current, {
                        [column.key]: {
                          filterValue,
                          filterFn: column.filterFn,
                        },
                      })
              
                      setData(
                        gameData.filter(item =>
                          Object.values(state).every(
                            ({ filterValue, filterFn }) =>
                              filterFn?.(item, filterValue) ?? true
                          )
                        )
                      )
                    },
                    100
                  )
                )

                return (
                  <DataGrid
                    // ...
                    onFiltersChange={filterData}
                  />
                )
              `}</CodeBlock>
              ),
            },
          ]}
        </Tabs>
        <H3>filterRowHeight</H3>
        <P>The height of the filter row. Defaults to 40px.</P>
      </Section>
      <Section>
        <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
          {[
            {
              id: 'react',
              label: 'React',
              component: (
                <Demo
                  demoUrl={`${
                    import.meta.env.VITE_REACT_DEMO_BASE_URL
                  }/demos/column-filtering`}
                  demoSrc={import('/../react/src/demos/ColumnFiltering.tsx?raw')}
                  height={407}
                />
              ),
            },
            {
              id: 'solid',
              label: 'Solid',
              component: (
                <Demo
                  demoUrl={`${
                    import.meta.env.VITE_REACT_DEMO_BASE_URL
                  }/demos/column-filtering`}
                  demoSrc={import('/../react/src/demos/ColumnFiltering.tsx?raw')}
                  height={407}
                />
              ),
            },
          ]}
        </Tabs>
      </Section>
      <HGroup justifyEnd>
        <PageButton href="/docs/columns/grouping" secondaryLabel="Previous">
          Column Grouping
        </PageButton>
        <PageButton href="/docs/columns/pinning" secondaryLabel="Next">
          Column Pinning
        </PageButton>
      </HGroup>
    </div>
  )
}
