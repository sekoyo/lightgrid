import { Code, H1, P, PageButton, HGroup, Section } from 'src/components/DocTypography'
import { useFrameworkTabs } from 'src/components/FrameworkTabContext'
import { Tabs } from 'src/components/Tabs'
import { Demo } from 'src/components/Demo'

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs()

  return (
    <div>
      <H1>Global filtering (search)</H1>
      <Section>
        <P>
          Data and state is controlled by you via props. You can create your own input and
          filter the <Code>data</Code> prop.
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
                  }/demos/global-filtering`}
                  demoSrc={import('/../react/src/demos/GlobalFiltering.tsx?raw')}
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
                  }/demos/global-filtering`}
                  demoSrc={import('/../react/src/demos/GlobalFiltering.tsx?raw')}
                  height={407}
                />
              ),
            },
          ]}
        </Tabs>
      </Section>
      <HGroup justifyEnd>
        <PageButton href="/docs/guides/theming" secondaryLabel="Previous">
          Theming
        </PageButton>
        <PageButton href="/docs/guides/async-data" secondaryLabel="Next">
          Async Data
        </PageButton>
      </HGroup>
    </div>
  )
}
