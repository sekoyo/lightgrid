import {
  Code,
  H1,
  P,
  PageButton,
  HGroup,
  Section,
  A,
  MessageBox,
  H2,
} from 'src/components/DocTypography'
import { useFrameworkTabs } from 'src/components/FrameworkTabContext'
import { Tabs } from 'src/components/Tabs'
import { Demo } from 'src/components/Demo'

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs()

  return (
    <div>
      <H1>Row Sorting</H1>
      <Section>
        <H2>Grid props</H2>
        <P>
          <Code>onColumnsChange</Code> - as with anything where the state of the columns
          can be changed, you must also implement the <Code>onColumnsChange</Code> prop to
          update the column state (see the code examples below).
        </P>
        <P>
          <Code>multiSort</Code> - allow sorting by multiple columns (see section below).
        </P>
        <H2>Column props</H2>
        <P>There are 4 column props which control sorting:</P>
        <P>
          <Code>sortable</Code> - whether or not this column can be sorted. This is the
          only prop you need to set yourself.
        </P>
        <P>
          <Code>sortDirection</Code> - the sort direction of this column (or undefined for
          no sort). You can set this to start off with a sort, but otherwise it will be
          set as the user toggles sorting on the columns
        </P>
        <P>
          <Code>createSortComparator</Code> - passes the current{' '}
          <Code>SortDirection</Code> and expects you to return a function which sorts the
          data. If this isn't specified then the built in sort function will be used.
        </P>
        <P>
          <Code>sortPriority</Code> - when sorting by multiple columns this determines
          which column is sorted first. Columns with lower values are sorted first.
          Usually you don't need to worry about setting this manually.
        </P>
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
                  }/demos/row-sorting`}
                  demoSrc={import('/../react/src/demos/RowSorting.tsx?raw')}
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
                  }/demos/row-sorting`}
                  demoSrc={import('/../react/src/demos/RowSorting.tsx?raw')}
                  height={407}
                />
              ),
            },
          ]}
        </Tabs>
      </Section>
      <Section>
        <H2>Sorting by multiple columns</H2>
        <P>
          In some case you may wish to sort by multiple columns. In this case pass{' '}
          <Code>multiSort=true</Code> into the Datagrid.
        </P>
        <P>
          You can also control which column has sort priority by setting the{' '}
          <Code>sortPriority</Code> on the column. Lower values have higher priority. By
          default the sort priority will be set for you based on which column the user
          sorted first.
        </P>
        <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
          {[
            {
              id: 'react',
              label: 'React',
              component: (
                <Demo
                  demoUrl={`${
                    import.meta.env.VITE_REACT_DEMO_BASE_URL
                  }/demos/multi-col-row-sorting`}
                  demoSrc={import('/../react/src/demos/MultiRowSorting.tsx?raw')}
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
                  }/demos/multi-col-row-sorting`}
                  demoSrc={import('/../react/src/demos/MultiRowSorting.tsx?raw')}
                  height={407}
                />
              ),
            },
          ]}
        </Tabs>
      </Section>
      <HGroup justifyEnd>
        <PageButton href="/docs/columns/reordering" secondaryLabel="Previous">
          Column Reordering
        </PageButton>
        <PageButton href="/docs/rows/grouping" secondaryLabel="Next">
          Row Grouping
        </PageButton>
      </HGroup>
    </div>
  )
}
