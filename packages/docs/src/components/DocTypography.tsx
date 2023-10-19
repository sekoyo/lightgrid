import { createMemo, JSX, type ParentProps } from 'solid-js'
import { A as RouterA, AnchorProps } from '@solidjs/router'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-css'
import 'src/assets/prism-theme.css'

import { cls } from 'src/utils/cls'
import { dedent } from 'src/utils/dedent'

import styles from './DocTypography.module.css'
import { useTheme } from './ThemeProvider'

export const H1 = (props: ParentProps) => <h1 class={styles.h1}>{props.children}</h1>
export const H2 = (props: ParentProps) => <h2 class={styles.h2}>{props.children}</h2>
export const H3 = (props: ParentProps) => <h3 class={styles.h3}>{props.children}</h3>
export const H4 = (props: ParentProps) => <h4 class={styles.h4}>{props.children}</h4>
export const H5 = (props: ParentProps) => <h5 class={styles.h5}>{props.children}</h5>
export const P = (props: ParentProps) => <p class={styles.p}>{props.children}</p>
export const Section = (props: ParentProps) => (
  <section class={styles.section}>{props.children}</section>
)
export const Secondary = (props: ParentProps) => (
  <span class={styles.secondary}>{props.children}</span>
)
export const A = (props: AnchorProps) => (
  <RouterA {...props} class={cls(styles.a, props.class)} />
)
export const UL = (props: ParentProps) => <ul class={styles.ul}>{props.children}</ul>
export const OL = (props: ParentProps) => <ol class={styles.ol}>{props.children}</ol>
export const LI = (props: ParentProps) => <li class={styles.li}>{props.children}</li>
export const ExternalLink = (props: ParentProps<{ href: string }>) => (
  <a
    class={styles.externalLink}
    href={props.href}
    target="_blank"
    rel="noopener noreferrer"
  >
    {props.children}
  </a>
)
export const EIcon = () => (
  <A href="/pricing" class={styles.eicon} title="Enterprise feature">
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
  const { state } = useTheme()
  return (
    <div class={styles.iframeContainer}>
      <iframe
        {...attrs}
        class={cls(styles.iframe, attrs.class)}
        src={`${attrs.src || ''}?theme=${state.theme}${
          typeof attrs.height === 'number' ? `&height=${attrs.height}` : ''
        }`}
      />
    </div>
  )
}

export const Code = (props: ParentProps) => (
  <code class={styles.code}>{props.children}</code>
)
export const CodeBlock = (props: { children: string; lang?: string; class?: string }) => {
  const parsedCode = createMemo(() =>
    props.lang
      ? Prism.highlight(dedent(props.children), Prism.languages[props.lang], props.lang)
      : dedent(props.children)
  )

  return (
    <pre class={cls(styles.codePre, `language-${props.lang}`, props.class)}>
      <code innerHTML={parsedCode()} />
    </pre>
  )
}

export const Table = (props: ParentProps) => (
  <table class={styles.table}>{props.children}</table>
)

export const MessageBox = (props: ParentProps<{ level: 'info' | 'warning' }>) => (
  <div class={styles.messageBox} data-level={props.level}>
    {props.children}
  </div>
)
