import { A, EIcon, H1, P, PageButton, HGroup } from 'src/components/DocTypography'

export default function Intro() {
  return (
    <div>
      <H1>Lightgrid</H1>
      <P>
        Lightgrid is a component for representing tabular data with a focus on being
        lightweight and performant but also full featured.
      </P>
      <P>
        It's headless, meaning the grid core is framework agnostic, while the UI framework
        takes care of rendering. At present we officially support React and Solid.
      </P>
      <P>
        It's opensource and the core features are free to use. However, other than for
        personal and non-profit use, you should <A href="/pricing">purchase</A> a license
        for features marked with <EIcon />.
      </P>
      <HGroup justifyEnd>
        <PageButton href="/docs/guides/setup" secondaryLabel="Next">
          Grid Setup
        </PageButton>
      </HGroup>
    </div>
  )
}
