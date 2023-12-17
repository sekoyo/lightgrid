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
} from 'src/components/DocTypography'
import { useFrameworkTabs } from 'src/components/FrameworkTabContext'
import { Tabs } from 'src/components/Tabs'
import { Demo } from 'src/components/Demo'

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs()

  return (
    <div>
      <H1>Cell Selection</H1>
      <Section>
        <P>
          You can enable cell selection with <Code>{`enableCellSelection={true}`}</Code>
        </P>
        <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
          {[
            {
              id: 'react',
              label: 'React',
              component: (
                <Demo
                  demoUrl={`${
                    import.meta.env.VITE_REACT_DEMO_BASE_URL
                  }/demos/cell-selection`}
                  demoSrc={import('/../react/src/demos/CellSelection.tsx?raw')}
                  height={407}
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
                  }/demos/cell-selection`}
                  demoSrc={import('/../react/src/demos/CellSelection.tsx?raw')}
                  height={407}
                />
              ),
            },
          ]}
        </Tabs>
      </Section>
      <HGroup justifyEnd>
        <PageButton href="/docs/columns/defining-columns" secondaryLabel="Previous">
          Defining Columns
        </PageButton>
        <PageButton href="/docs/columns/sorting" secondaryLabel="Next">
          Column Sorting
        </PageButton>
      </HGroup>
    </div>
  )
}
