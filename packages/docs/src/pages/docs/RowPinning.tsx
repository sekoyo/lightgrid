import {
  Code,
  H1,
  P,
  PageButton,
  HGroup,
  Section,
} from "src/components/DocTypography";
import { useFrameworkTabs } from "src/components/FrameworkTabContext";
import { Tabs } from "src/components/Tabs";
import { Demo } from "src/components/Demo";

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs();

  return (
    <div>
      <H1>Row Pinning</H1>
      <Section>
        <P>
          Row pinning is done by passing row data to <Code>pinnedTopData</Code>{" "}
          and <Code>pinnedBottomData</Code> props.
        </P>
        <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
          {[
            {
              id: "react",
              label: "React",
              component: (
                <Demo
                  demoUrl={`${
                    import.meta.env.VITE_REACT_DEMO_BASE_URL
                  }/demos/row-pinning`}
                  demoSrc={import("/../react/src/demos/RowPinning.tsx?raw")}
                />
              ),
            },
            {
              id: "solid",
              label: "Solid",
              component: (
                <Demo
                  demoUrl={`${
                    import.meta.env.VITE_SOLID_DEMO_BASE_URL
                  }/demos/row-pinning`}
                  demoSrc={
                    import("/../solid/src/routes/demos/row-pinning.tsx?raw")
                  }
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
  );
}
