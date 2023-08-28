import {
  CodeBlock,
  H1,
  P,
  PageButton,
  HGroup,
  LI,
  OL,
  Section,
  Code,
} from 'src/components/DocTypography'
import { useFrameworkTabs } from 'src/components/FrameworkTabContext'
import { Tabs } from 'src/components/Tabs'
import { Demo } from 'src/components/Demo'

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs()

  return (
    <div>
      <H1>Async Data</H1>
      <Section>
        <P>
          It's common to need to fetch data from an external source such as an API. How
          you do this is up to you, once the data is fetched you just need to update your{' '}
          <Code>data</Code> prop.
        </P>
        <P>
          You can also provide your own loading overlay via the{' '}
          <Code>loadingOverlay</Code> prop.
        </P>
      </Section>
      <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
        {[
          {
            id: 'react',
            label: 'React',
            component: (
              <Demo
                demoUrl={`${import.meta.env.VITE_REACT_DEMO_BASE_URL}/demos/async-data`}
                demoSrc={import('/../react/src/demos/AsyncDataDemo.tsx?raw')}
                height={405}
              />
            ),
          },
          {
            id: 'solid',
            label: 'Solid',
            component: (
              <Demo
                demoUrl={`${import.meta.env.VITE_REACT_DEMO_BASE_URL}/demos/async-data`}
                demoSrc={import('/../react/src/demos/AsyncDataDemo.tsx?raw')}
                height={405}
              />
            ),
          },
        ]}
      </Tabs>
      <HGroup justifyEnd>
        <PageButton href="/docs" secondaryLabel="Previous">
          Intro
        </PageButton>
        <PageButton href="/docs/guides/theming" secondaryLabel="Next">
          Theming
        </PageButton>
      </HGroup>
    </div>
  )
}
