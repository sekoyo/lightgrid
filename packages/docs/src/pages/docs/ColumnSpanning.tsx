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
      <H1>Column Spanning</H1>
      <Section>
        <P>
          Column spanning is done by add a{" "}
          <Code>{`colSpan?: (item: T) => number`}</Code> function to a column
          definition. Anything greater than <Code>1</Code> will make the cell
          span into adjacent cells. <Code>-1</Code> means span over all columns
          in the grid area.
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
                  }/demos/column-spanning`}
                  demoSrc={import("/../react/src/demos/ColumnSpanning.tsx?raw")}
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
                  }/demos/column-spanning`}
                  demoSrc={
                    import("/../solid/src/routes/demos/column-spanning.tsx?raw")
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
