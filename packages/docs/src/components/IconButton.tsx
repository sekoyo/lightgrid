import type { JSX } from 'solid-js'
import { cls } from 'src/utils/cls'
import styles from './IconButton.module.css'

export function IconButton(attrs: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...attrs} class={cls(styles.iconBtn, attrs.class)} />
}
