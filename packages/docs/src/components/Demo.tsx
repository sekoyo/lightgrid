import { createEffect, createSignal, mergeProps } from 'solid-js'
import { CodeBlock, IFrame } from './DocTypography'

import styles from './Demo.module.css'

interface DemoProps {
  demoUrl: string
  demoSrc: Promise<typeof import('*?raw')>
  height?: number
}

export function Demo(props: DemoProps) {
  const height = () => props.height || 600
  const [src, setSrc] = createSignal('')
  const [view, setView] = createSignal<'demo' | 'source'>('demo')
  createEffect(() => {
    if (view() === 'source') {
      props.demoSrc.then(m => setSrc(m.default))
    }
  })
  return (
    <div class={styles.container}>
      {view() === 'demo' ? (
        <IFrame src={props.demoUrl} height={height()} />
      ) : (
        <div style={{ height: `${height()}px` }}>
          {!src() ? (
            'Loading...'
          ) : (
            <CodeBlock class={styles.code} lang="typescript">
              {src()}
            </CodeBlock>
          )}
        </div>
      )}
      <div class={styles.switchContainer}>
        <button
          class={styles.switchBtn}
          disabled={view() === 'demo'}
          onClick={() => setView('demo')}
        >
          Demo{' '}
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18.84 2.5H5.16a2.59 2.59 0 0 0-2.59 2.59v13.68a2.59 2.59 0 0 0 2.59 2.59h13.68a2.59 2.59 0 0 0 2.59-2.59V5.09a2.59 2.59 0 0 0-2.59-2.59zm-13.68 1h13.68a1.59 1.59 0 0 1 1.59 1.59v2.52H3.57V5.09A1.59 1.59 0 0 1 5.16 3.5zm9.34 5.11v11.75h-5V8.61zM3.57 18.77V8.61H8.5v11.75H5.16a1.59 1.59 0 0 1-1.59-1.59zm15.27 1.59H15.5V8.61h4.93v10.16a1.59 1.59 0 0 1-1.59 1.59z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          class={styles.switchBtn}
          disabled={view() === 'source'}
          onClick={() => setView('source')}
        >
          Source
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="m1.293 12.707 4 4a1 1 0 1 0 1.414-1.414L3.414 12l3.293-3.293a1 1 0 1 0-1.414-1.414l-4 4a1 1 0 0 0 0 1.414zM18.707 7.293a1 1 0 1 0-1.414 1.414L20.586 12l-3.293 3.293a1 1 0 1 0 1.414 1.414l4-4a1 1 0 0 0 0-1.414zM13.039 4.726l-4 14a1 1 0 0 0 .686 1.236A1.053 1.053 0 0 0 10 20a1 1 0 0 0 .961-.726l4-14a1 1 0 1 0-1.922-.548z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
