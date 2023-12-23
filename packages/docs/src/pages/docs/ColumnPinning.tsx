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
      <H1>Column Pinning</H1>
      <Section>
        <P>
          You can pin both columns and groups. If you pin a group, it's
          descendents will inherit that pin.
        </P>
        <P>
          To pin, add <Code>pin: 'start'</Code> (left side) or{" "}
          <Code>pin: 'end'</Code> (right side) to a column or column group.
        </P>
        <P>It doesn't matter where the column/group is in the columns array.</P>
      </Section>
      <Section>
        <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
          {[
            {
              id: "react",
              label: "React",
              component: (
                <Demo
                  demoUrl={`${
                    import.meta.env.VITE_REACT_DEMO_BASE_URL
                  }/demos/column-pinning`}
                  demoSrc={import("/../react/src/demos/ColumnPinning.tsx?raw")}
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
                  }/demos/column-pinning`}
                  demoSrc={import("/../react/src/demos/ColumnPinning.tsx?raw")}
                />
              ),
            },
          ]}
        </Tabs>
      </Section>
      <HGroup justifyEnd>
        <PageButton href="/docs/columns/filtering" secondaryLabel="Previous">
          Column Filtering
        </PageButton>
        <PageButton href="/docs/columns/resizing" secondaryLabel="Next">
          Column Resizing
        </PageButton>
      </HGroup>
    </div>
  );
}
