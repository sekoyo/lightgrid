import { A, Code, EIcon, H1, P, PageButton, HGroup } from 'src/components/DocTypography'

export default function ReactSetup() {
  return (
    <div>
      <H1>React Setup</H1>
      <P>Install the dependency with your chosen dependency manager:</P>
      <Code>{`
        npm install @lightfin/react-datagrid
        yarn add @lightfin/react-datagrid
        pnpm add @lightfin/react-datagrid
      `}</Code>
      <P>Include the CSS:</P>
      <Code lang="typescript">{`
        import '@lightfin/react-datagrid/dist/styles.css'
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
      <HGroup justifyEnd>
        <PageButton href="/docs/" secondaryLabel="Previous">
          Intro
        </PageButton>
        <PageButton href="/docs/guides/theming" secondaryLabel="Next">
          Theming
        </PageButton>
      </HGroup>
    </div>
  )
}
