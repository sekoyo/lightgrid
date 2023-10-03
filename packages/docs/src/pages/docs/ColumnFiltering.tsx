import { Code, H1, P, PageButton, HGroup, Section, A } from 'src/components/DocTypography'
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
          Data and column headers are controlled by you, you can implement filtering by
          customizing the column header.
        </P>
        <P>
          If you want to search across all columns see{' '}
          <A href="/docs/guides/global-search">Global Search</A>
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
