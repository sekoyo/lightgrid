import { createEffect, createSignal, type JSX } from 'solid-js'
import styles from './Demo.module.css'
import { Code, IFrame } from './DocTypography'

interface DemoProps {
  demoUrl: string
  demoSrc: Promise<typeof import('*?raw')>
  demoHeight?: number
}

export function Demo(props: DemoProps) {
  const [src, setSrc] = createSignal('')
  createEffect(() => {
    props.demoSrc.then(m => setSrc(m.default))
  })
  return (
    <div class={styles.container}>
      <IFrame src={props.demoUrl} height={props.demoHeight || 600} />
      <Code class={styles.code} lang="typescript">
        {src()}
      </Code>
    </div>
  )
}
