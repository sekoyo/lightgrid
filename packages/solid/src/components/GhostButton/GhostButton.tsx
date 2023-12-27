import { type JSX } from 'solid-js'
import styles from './GhostButton.module.scss'

interface IconButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number
}

export function GhostButton(attrs: IconButtonProps) {
  return <button {...attrs} class={`${styles.btn} ${attrs.class}`} />
}
