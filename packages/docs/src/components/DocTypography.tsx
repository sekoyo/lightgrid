import type { JSX, ParentProps } from 'solid-js'
import { A as RouterA, AnchorProps } from '@solidjs/router'
import styles from './DocTypography.module.css'
import { cls } from 'src/utils/cls'

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
