import {
  Code,
  H1,
  P,
  PageButton,
  HGroup,
  Section,
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
      <H1>Detail Rows</H1>
      <Section>
        <P>In order to show row details we need to:</P>
        <P>
          <OL>
            <LI>
              Add an expansion column (<Code>columns</Code>)
            </LI>
            <LI>
              Tell the grid whether a row has a child details row (
              <Code>getRowMeta</Code> )
            </LI>
            <LI>
              Choose whatever you want to render in this details row (
              <Code>renderRowDetails</Code>)
            </LI>
            <LI>
              Pass in <Code>rowState</Code> and <Code>setRowState</Code> so that
              the grid knows whether to render a details row (expanded), and so
              our expansion column can toggle the expansion state.
            </LI>
          </OL>
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
                  }/demos/detail-rows`}
                  demoSrc={import("/../react/src/demos/DetailRows.tsx?raw")}
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
                  }/demos/detail-rows`}
                  demoSrc={import("/../react/src/demos/DetailRows.tsx?raw")}
                />
              ),
            },
          ]}
        </Tabs>
      </Section>
      <HGroup justifyEnd>
        <PageButton href="/docs/rows/row-grouping" secondaryLabel="Previous">
          Row Pinning
        </PageButton>
        <PageButton href="/docs/cells/editing" secondaryLabel="Next">
          Cell Editing
        </PageButton>
      </HGroup>
    </div>
  );
}
