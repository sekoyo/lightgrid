import { Code, H1, P, PageButton, HGroup, Section, A } from 'src/components/DocTypography'
import { useFrameworkTabs } from 'src/components/FrameworkTabContext'
import { Tabs } from 'src/components/Tabs'
import { Demo } from 'src/components/Demo'

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs()

  return (
    <div>
      <H1>Column Grouping</H1>
      <Section>
        <P>
          The <Code>columns</Code> prop can be an array of column or column groups, and
          groups can also be nested. See{' '}
          <A href="/docs/columns/defining-columns">Defining Columns</A> for a definition
          of both.
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
                  }/demos/column-grouping`}
                  demoSrc={import('/../react/src/demos/ColumnGrouping.tsx?raw')}
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
                  }/demos/column-grouping`}
                  demoSrc={import('/../react/src/demos/ColumnGrouping.tsx?raw')}
                  height={407}
                />
              ),
            },
          ]}
        </Tabs>
      </Section>
      <HGroup justifyEnd>
        <PageButton href="/docs/columns/defining-columns" secondaryLabel="Previous">
          Defining Columns
        </PageButton>
        <PageButton href="/docs/columns/sorting" secondaryLabel="Next">
          Sorting
        </PageButton>
      </HGroup>
    </div>
  )
}
