import { H1, P, PageButton, HGroup, Section, A, Code } from 'src/components/DocTypography'
import { useFrameworkTabs } from 'src/components/FrameworkTabContext'
import { Tabs } from 'src/components/Tabs'
import { Demo } from 'src/components/Demo'

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs()

  return (
    <div>
      <H1>Column Resizing</H1>
      <Section>
        <P>
          You can enable resizing with the <Code>enableColumnResize</Code>. As with any
          columns changes you should also implement <Code>onColumnsChange</Code>.
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
                  }/demos/column-resizing`}
                  demoSrc={import('/../react/src/demos/ColumnResizing.tsx?raw')}
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
                  }/demos/column-resizing`}
                  demoSrc={import('/../react/src/demos/ColumnResizing.tsx?raw')}
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
