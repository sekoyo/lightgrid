import {
  A,
  Code,
  EIcon,
  H1,
  IFrame,
  P,
  PageButton,
  HGroup,
} from 'src/components/DocTypography'
import { useFrameworkTabs } from 'src/components/FrameworkTabContext'
import { Tabs } from 'src/components/Tabs'

export default function BasicGrid() {
  const { state, changeTab } = useFrameworkTabs()

  return (
    <div>
      <H1>Grid Setup</H1>
      <P>Install the grid package:</P>
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
      <P>Include the CSS:</P>
      <Code lang="typescript">{`
        import '@lightfin/datagrid/dist/styles.css'
      `}</Code>
      <Code lang="typescript">{`
        export const HGroup = (props: ParentProps<{ justifyEnd?: boolean }>) => (
          <div class={cls(styles.hGroup, props.justifyEnd && styles.hGroupEndAlign)}>
            {props.children}
          </div>
        )
      `}</Code>
      <P>
        It's headless, meaning the grid core is framework agnostic, while the UI framework
        takes care of rendering. At present we officially support React and Solid.
      </P>
      <P>
        It's opensource and the core features are free to use. However you should{' '}
        <A href="/pricing">purchase</A> a license for features marked with <EIcon />
      </P>
      <IFrame
        src={`${import.meta.env.VITE_REACT_DEMO_BASE_URL}/demos/basic-grid`}
        height={600}
      />
      <HGroup justifyEnd>
        <PageButton href="/docs/guides/solid-setup" secondaryLabel="Previous">
          Solid Setup
        </PageButton>
        <PageButton href="/docs/guides/react-setup" secondaryLabel="Previous">
          React Setup
        </PageButton>
        <PageButton href="/docs/guides/theming" secondaryLabel="Next">
          Theming
        </PageButton>
      </HGroup>
    </div>
  )
}
