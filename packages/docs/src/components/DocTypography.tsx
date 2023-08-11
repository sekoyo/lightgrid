import { createMemo, JSX, type ParentProps } from 'solid-js'
import { A as RouterA, AnchorProps } from '@solidjs/router'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-bash'
import 'src/assets/prism-theme.css'

import { cls } from 'src/utils/cls'
import { dedent } from 'src/utils/dedent'

import styles from './DocTypography.module.css'

export const H1 = (props: ParentProps) => <h1 class={styles.h1}>{props.children}</h1>

export const H2 = (props: ParentProps) => <h2 class={styles.h1}>{props.children}</h2>

export const P = (props: ParentProps) => <p class={styles.p}>{props.children}</p>

export const A = (props: AnchorProps) => (
  <RouterA {...props} class={cls(styles.a, props.class)} />
)

export const EIcon = () => (
  <A href="/pricing" class={styles.eicon} aria-labelledby="Go to pricing page">
    E
  </A>
)

export const PageButton = (
  props: ParentProps<{ href: string; secondaryLabel?: string }>
) => (
  <A href={props.href} class={styles.pageButton}>
    {props.secondaryLabel && (
      <span class={styles.pageButtonLabel}>{props.secondaryLabel}</span>
    )}
    <span>{props.children}</span>
  </A>
)

export const HGroup = (props: ParentProps<{ justifyEnd?: boolean }>) => (
  <div class={cls(styles.hGroup, props.justifyEnd && styles.hGroupEndAlign)}>
    {props.children}
  </div>
)

export const VGroup = (props: ParentProps<{ justifyEnd?: boolean }>) => (
  <div class={cls(styles.vGroup, props.justifyEnd && styles.vGroupEndAlign)}>
    {props.children}
  </div>
)

export const IFrame = (attrs: JSX.IframeHTMLAttributes<HTMLIFrameElement>) => {
  return (
    <div class={styles.iframeContainer}>
      <iframe
        {...attrs}
        class={cls(styles.iframe, attrs.class)}
        src={`${
          (attrs.src || '') +
          (typeof attrs.height === 'number' ? `?height=${attrs.height}` : '')
        }`}
      />
    </div>
  )
}

export const Code = (props: { children: string; lang?: string }) => {
  const parsedCode = createMemo(() =>
    props.lang
      ? Prism.highlight(dedent(props.children), Prism.languages[props.lang], props.lang)
      : dedent(props.children)
  )

  return (
    <pre class={`language-${props.lang}`}>
      <code innerHTML={parsedCode()} />
    </pre>
  )
}
