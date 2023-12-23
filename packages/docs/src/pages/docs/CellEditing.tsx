import {
  Code,
  H1,
  P,
  PageButton,
  HGroup,
  Section,
  A,
  CodeBlock,
  OL,
  LI,
} from "src/components/DocTypography";
import { useFrameworkTabs } from "src/components/FrameworkTabContext";
import { Tabs } from "src/components/Tabs";
import { Demo } from "src/components/Demo";

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs();

  return (
    <div>
      <H1>Cell Editing</H1>
      <Section>
        <P>Cell editing can be achieved by creating custom cell renderers.</P>
        <P>In this demo we create a custom cell component which:</P>
        <OL>
          <LI>Renders a read-only cell</LI>
          <LI>Listens to double click</LI>
          <LI>On click, renders an edit cell</LI>
          <LI>
            As the user types the edit state is kept internal to the cell. If
            the user presses enter it is commited via <Code>onCommit</Code>{" "}
            which updates the data. If the user presses Escape the changes are
            cancelled.
          </LI>
          <LI>The cell then returns the read-only mode</LI>
        </OL>
        <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
          {[
            {
              id: "react",
              label: "React",
              component: (
                <Demo
                  demoUrl={`${
                    import.meta.env.VITE_REACT_DEMO_BASE_URL
                  }/demos/cell-editing`}
                  demoSrc={import("/../react/src/demos/CellEditing.tsx?raw")}
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
                  }/demos/cell-editing`}
                  demoSrc={import("/../react/src/demos/CellEditing.tsx?raw")}
                />
              ),
            },
          ]}
        </Tabs>
      </Section>
      <HGroup justifyEnd>
        <PageButton
          href="/docs/columns/defining-columns"
          secondaryLabel="Previous"
        >
          Defining Columns
        </PageButton>
        <PageButton href="/docs/columns/sorting" secondaryLabel="Next">
          Column Sorting
        </PageButton>
      </HGroup>
    </div>
  );
}
