import {
  H1,
  P,
  PageButton,
  HGroup,
  Section,
  H3,
  Code,
  H2,
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
        <H2>Finite pagination</H2>
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
      <Section>
        <H2>Infinite pagination</H2>
        <P>
          In cases where you don't know the total data count you can lazily load more
          data. Usually the server will implement offset or cursor based pagination to
          allow you to get the next <em>n</em> batch of items until it tells you there are
          no more.
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
                }/demos/infinite-pagination`}
                demoSrc={import('/../react/src/demos/InfinitePaginationDemo.tsx?raw')}
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
                }/demos/infinite-pagination`}
                demoSrc={import('/../react/src/demos/InfinitePaginationDemo.tsx?raw')}
                height={420}
              />
            ),
          },
        ]}
      </Tabs>
      <HGroup justifyEnd>
        <PageButton href="/docs/guides/async-data" secondaryLabel="Previous">
          Async Data
        </PageButton>
        <PageButton href="/docs/columns/defining-columns" secondaryLabel="Next">
          Defining Columns
        </PageButton>
      </HGroup>
    </div>
  )
}
