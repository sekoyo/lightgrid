import {
  Code,
  H1,
  P,
  PageButton,
  HGroup,
  LI,
  OL,
  Section,
} from 'src/components/DocTypography'
import { useFrameworkTabs } from 'src/components/FrameworkTabContext'
import { Tabs } from 'src/components/Tabs'
import { Demo } from 'src/components/Demo'

export default function BasicGrid() {
  const { state, changeTab } = useFrameworkTabs()

  return (
    <div>
      <H1>Setup</H1>
      <Section>
        <P>Install the datagrid package for your framework</P>
        <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
          {[
            {
              id: 'react',
              label: 'React',
              component: (
                <Code lang="bash">{`
                npm install @lightfin/react-datagrid
                yarn add @lightfin/react-datagrid
                pnpm add @lightfin/react-datagrid
              `}</Code>
              ),
            },
            {
              id: 'solid',
              label: 'Solid',
              component: (
                <Code lang="bash">{`
                npm install @lightfin/solid-datagrid
                yarn add @lightfin/solid-datagrid
                pnpm add @lightfin/solid-datagrid
              `}</Code>
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
              id: 'react',
              label: 'React',
              component: (
                <Code lang="bash">{`
                import { Datagrid } from '@lightfin/react-datagrid'
              `}</Code>
              ),
            },
            {
              id: 'solid',
              label: 'Solid',
              component: (
                <Code lang="bash">{`
              import { Datagrid } from '@lightfin/solid-datagrid'
              `}</Code>
              ),
            },
          ]}
        </Tabs>
      </Section>
      <Section>
        <P>Include the CSS</P>
        <Code lang="typescript">{`
        import '@lightfin/datagrid/dist/styles.css'
      `}</Code>
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
      <Demo
        demoUrl={`${import.meta.env.VITE_REACT_DEMO_BASE_URL}/demos/basic-grid`}
        demoSrc={import('/../react/src/demos/BasicGrid.tsx?raw')}
      />
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
