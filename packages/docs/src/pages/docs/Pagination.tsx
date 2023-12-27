import {
  H1,
  P,
  PageButton,
  HGroup,
  Section,
  H3,
  Code,
  H2,
} from "src/components/DocTypography";
import { useFrameworkTabs } from "src/components/FrameworkTabContext";
import { Tabs } from "src/components/Tabs";
import { Demo } from "src/components/Demo";

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs();

  return (
    <div>
      <H1>Pagination</H1>
      <Section>
        <H2>Finite pagination</H2>
        <P>
          When you know the length of your data you can use standard pagination
          navigation controls to go back, forwards, first, last etc.
        </P>
      </Section>
      <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
        {[
          {
            id: "react",
            label: "React",
            component: (
              <Demo
                demoUrl={`${
                  import.meta.env.VITE_REACT_DEMO_BASE_URL
                }/demos/finite-pagination`}
                demoSrc={import("/../react/src/demos/FinitePagination.tsx?raw")}
                height="420px"
              />
            ),
          },
          {
            id: "solid",
            label: "Solid",
            component: (
              <Demo
                demoUrl={`${
                  import.meta.env.VITE_REACT_DEMO_BASE_URL
                }/demos/finite-pagination`}
                demoSrc={import("/../react/src/demos/FinitePagination.tsx?raw")}
                height="420px"
              />
            ),
          },
        ]}
      </Tabs>
      <Section>
        <H2>Infinite pagination</H2>
        <P>
          In cases where you don't know the total data count you can lazily load
          more data. Usually the server will implement offset or cursor based
          pagination to allow you to get the next <em>n</em> batch of items
          until it tells you there are no more.
        </P>
      </Section>
      <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
        {[
          {
            id: "react",
            label: "React",
            component: (
              <Demo
                demoUrl={`${
                  import.meta.env.VITE_REACT_DEMO_BASE_URL
                }/demos/infinite-pagination`}
                demoSrc={
                  import("/../react/src/demos/InfinitePagination.tsx?raw")
                }
                height="420px"
              />
            ),
          },
          {
            id: "solid",
            label: "Solid",
            component: (
              <Demo
                demoUrl={`${
                  import.meta.env.VITE_REACT_DEMO_BASE_URL
                }/demos/infinite-pagination`}
                demoSrc={
                  import("/../react/src/demos/InfinitePagination.tsx?raw")
                }
                height="420px"
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
  );
}
