import { Code, H1, P, PageButton, HGroup, Section } from 'src/components/DocTypography'
import { useFrameworkTabs } from 'src/components/FrameworkTabContext'
import { Tabs } from 'src/components/Tabs'
import { Demo } from 'src/components/Demo'

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs()

  return (
    <div>
      <H1>Row Spanning</H1>
      <Section>
        <P>
          Row spanning is done by add a <Code>{`rowSpan?: (item: T) => number`}</Code>{' '}
          function to a column definition. Anything greater than <Code>1</Code> will make
          the cell span into adjacent cells. <Code>-1</Code> means span over all rows in
          the grid area.
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
                  }/demos/row-spanning`}
                  demoSrc={import('/../react/src/demos/RowSpanning.tsx?raw')}
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
                  }/demos/row-spanning`}
                  demoSrc={import('/../react/src/demos/RowSpanning.tsx?raw')}
                  height={407}
                />
              ),
            },
          ]}
        </Tabs>
      </Section>
      <HGroup justifyEnd>
        <PageButton href="/docs/rows/row-grouping" secondaryLabel="Previous">
          Row Grouping
        </PageButton>
        <PageButton href="/docs/rows/detail-rows" secondaryLabel="Next">
          Detail Rows
        </PageButton>
      </HGroup>
    </div>
  )
}
