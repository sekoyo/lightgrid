import {
  H1,
  P,
  PageButton,
  HGroup,
  Section,
  H3,
  Code,
} from 'src/components/DocTypography'
import { useFrameworkTabs } from 'src/components/FrameworkTabContext'
import { Tabs } from 'src/components/Tabs'
import { Demo } from 'src/components/Demo'

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs()

  return (
    <div>
      <H1>Pagination</H1>
      <Section>
        <P>
          Pagination is built by you, using your own components. Since the datagrid is
          controlled you simply have to pass the updated data via the <Code>data</Code>{' '}
          prop as new pages are loaded in.
        </P>
        <P>There are two types of pagination:</P>
      </Section>
      <Section>
        <H3>Finite pagination</H3>
        <P>
          When you know the length of your data you can use standard pagination navigation
          controls to go back, forwards, first, last etc.
        </P>
      </Section>
      <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
        {[
          {
            id: 'react',
            label: 'React',
            component: (
              <Demo
                demoUrl={`${
                  import.meta.env.VITE_REACT_DEMO_BASE_URL
                }/demos/finite-pagination`}
                demoSrc={import('/../react/src/demos/FinitePaginationDemo.tsx?raw')}
                height={420}
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
                }/demos/finite-pagination`}
                demoSrc={import('/../react/src/demos/FinitePaginationDemo.tsx?raw')}
                height={420}
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
