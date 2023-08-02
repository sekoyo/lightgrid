import { A, EIcon, H1, P } from 'src/components/DocTypography'

export default function IntroDoc() {
  return (
    <div>
      <H1>Lightfin Datagrid</H1>
      <P>
        Lightfin Datagrid is a headless datagrid for representing tabular data with a
        focus on being lightweight and performant but also full featured.
      </P>
      <P>
        Headless means that our grid logic is framework agnostic, while the UI framework
        takes care of the rendering. At present we officially support React and Solid.
      </P>
      <P>
        It's opensource and the core features are free to use. However you should{' '}
        <A href="/pricing">purchase</A> a license for features marked with <EIcon />
      </P>
    </div>
  )
}
