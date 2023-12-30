import {
  Code,
  H1,
  P,
  PageButton,
  HGroup,
  Section,
  A,
  CodeBlock,
} from "src/components/DocTypography";
import { useFrameworkTabs } from "src/components/FrameworkTabContext";
import { Tabs } from "src/components/Tabs";
import { Demo } from "src/components/Demo";

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs();

  return (
    <div>
      <H1>Row Grouping</H1>
      <Section>
        <P>
          Row grouping is a concept that exists outside the datagrid. If you
          think about it, it's just a datagrid with rows of two different types:
          either a grouping row, or a data item.
        </P>
        <P>
          Lightfin provides a utility method <Code>groupData</Code> to group
          your data. We pass in our <Code>rowState</Code> to determine what
          should be expanded.
        </P>
        <CodeBlock lang="typescript">{`
          groupData<Medalist>(
            data,
            ['country', 'medal_type', 'athlete_sex'],
            rowState,
            2, // optional: "expand 2 levels by default"
          )
        `}</CodeBlock>
        <P>
          Strings for the groups only works for simple getters. You can also use
          an object to normalize or access nested data:
        </P>
        <CodeBlock lang="typescript">{`
          {
            key: 'country',
            getValue: item => item.country.toLowerCase()
          }
        `}</CodeBlock>
        <P>
          We also need to create a grouping column. And all columns need to
          distinguish if they are rendering a grouping or normal row using{" "}
          <Code>isRowGroup(item)</Code>
        </P>
        <P>
          In the grouping column we only want to render something if it's a row
          group:
        </P>
        <CodeBlock lang="typescript">{`
          {
            key: 'group',
            header: 'Group',
            getValue: d => d.id,
            cellComponent: ({ item }) => {
              if (isRowGroup(item)) {
                return (
                  <div>Special grouping cell</div>
                )
              }
            }
          }
        `}</CodeBlock>
        <P>
          For other columns we only want to render something if it's not a
          grouping row:
        </P>
        <CodeBlock lang="typescript">{`
          {
            key: 'athlete_name',
            header: 'Athelete',
            getValue: d => !isRowGroup(d) && d.athlete_name
          }
        `}</CodeBlock>
        <P>
          For Typescript users we also want to tell the Datagrid that a row item
          can be either a group or data item:
        </P>
        <CodeBlock lang="typescript">{`
          <DataGrid<GroupRow | Medalist>
            columns={columns}
            data={groupedData}
            getRowId={d => d.id}
            rowState={rowState}
            setRowState={setRowState}
          />
        `}</CodeBlock>
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
                  }/demos/row-grouping`}
                  demoSrc={import("/../react/src/demos/RowGrouping.tsx?raw")}
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
                  }/demos/row-grouping`}
                  demoSrc={
                    import("/../solid/src/routes/demos/row-grouping.tsx?raw")
                  }
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
