import {
  Code,
  CodeBlock,
  H1,
  P,
  PageButton,
  HGroup,
  Section,
} from 'src/components/DocTypography'
import { useFrameworkTabs } from 'src/components/FrameworkTabContext'
import { Tabs } from 'src/components/Tabs'
import { Demo } from 'src/components/Demo'

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs()

  return (
    <div>
      <H1>Theming</H1>
      <Section>
        <P>
          The datagrid comes with a light and a dark theme, but you can override all or
          part of them via the <Code>theme</Code> prop.
        </P>
        <CodeBlock lang="typescript">{`
          import { darkTheme, lightTheme, type Theme } from '@lightfin/datagrid'

          <DataGrid theme={darkTheme}>
          // Or:
          <DataGrid theme={lightTheme}>
        
          // Or create a custom theme
          const myCustomTheme: Theme = {
            ...darkTheme,
            headerCellBg: 'rgb(93, 126, 234)',
          }
          <DataGrid theme={myCustomTheme}>
        `}</CodeBlock>
      </Section>
      <Section>
        <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
          {[
            {
              id: 'react',
              label: 'React',
              component: (
                <Demo
                  demoUrl={`${import.meta.env.VITE_REACT_DEMO_BASE_URL}/demos/theming`}
                  demoSrc={import('/../react/src/demos/ThemingDemo.tsx?raw')}
                  height={362}
                />
              ),
            },
            {
              id: 'solid',
              label: 'Solid',
              component: (
                <Demo
                  demoUrl={`${import.meta.env.VITE_REACT_DEMO_BASE_URL}/demos/theming`}
                  demoSrc={import('/../react/src/demos/ThemingDemo.tsx?raw')}
                  height={362}
                />
              ),
            },
          ]}
        </Tabs>
      </Section>
      <HGroup justifyEnd>
        <PageButton href="/docs/guides/setup" secondaryLabel="Previous">
          Setup
        </PageButton>
        <PageButton href="/docs/guides/global-search" secondaryLabel="Next">
          Global Search
        </PageButton>
      </HGroup>
    </div>
  )
}
