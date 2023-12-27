import {
  CodeBlock,
  H1,
  P,
  PageButton,
  HGroup,
  LI,
  OL,
  Section,
} from "src/components/DocTypography";
import { useFrameworkTabs } from "src/components/FrameworkTabContext";
import { Tabs } from "src/components/Tabs";
import { Demo } from "src/components/Demo";

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs();

  return (
    <div>
      <H1>Setup</H1>
      <Section>
        <P>Install the core package and the one for your framework</P>
        <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
          {[
            {
              id: "react",
              label: "React",
              component: (
                <CodeBlock lang="bash">{`
                npm install @lightfin/datagrid
                yarn add @lightfin/datagrid
                pnpm add @lightfin/datagrid

                npm install @lightfin/react-datagrid
                yarn add @lightfin/react-datagrid
                pnpm add @lightfin/react-datagrid
              `}</CodeBlock>
              ),
            },
            {
              id: "solid",
              label: "Solid",
              component: (
                <CodeBlock lang="bash">{`
                npm install @lightfin/datagrid
                yarn add @lightfin/datagrid
                pnpm add @lightfin/datagrid

                npm install @lightfin/solid-datagrid
                yarn add @lightfin/solid-datagrid
                pnpm add @lightfin/solid-datagrid
              `}</CodeBlock>
              ),
            },
          ]}
        </Tabs>
      </Section>
      <Section>
        <P>Include the Datagrid component</P>
        <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
          {[
            {
              id: "react",
              label: "React",
              component: (
                <CodeBlock lang="bash">{`
                import { Datagrid } from '@lightfin/react-datagrid'
              `}</CodeBlock>
              ),
            },
            {
              id: "solid",
              label: "Solid",
              component: (
                <CodeBlock lang="bash">{`
              import { Datagrid } from '@lightfin/solid-datagrid'
              `}</CodeBlock>
              ),
            },
          ]}
        </Tabs>
      </Section>
      <Section>
        <P>Include the CSS</P>
        <CodeBlock lang="typescript">{`
        import '@lightfin/datagrid/dist/styles.css'
      `}</CodeBlock>
      </Section>
      <P>All grids must define three things</P>
      <OL>
        <LI>
          <strong>Data</strong> an array of data to render each row with
        </LI>
        <LI>
          <strong>Columns</strong> the grid columns
        </LI>
        <LI>
          <strong>Row ID</strong> a unique ID for each row
        </LI>
      </OL>
      <P>These three props get us a simple, read-only table</P>
      <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
        {[
          {
            id: "react",
            label: "React",
            component: (
              <Demo
                demoUrl={`${
                  import.meta.env.VITE_REACT_DEMO_BASE_URL
                }/demos/basic-grid`}
                demoSrc={import("/../react/src/demos/BasicGrid.tsx?raw")}
                height="362px"
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
                }/demos/basic-grid`}
                demoSrc={
                  import("/../solid/src/routes/demos/basic-grid.tsx?raw")
                }
                height="362px"
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
  );
}
