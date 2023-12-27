import { type JSX } from 'solid-js'
import styles from './IconButton.module.css'

export function IconButton(attrs: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...attrs} class={`${styles.iconButton} ${attrs.class}`} />
}
