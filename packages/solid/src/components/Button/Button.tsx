import { type JSX } from 'solid-js'
import { cls } from '@lightfin/datagrid'
import styles from './Button.module.css'

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', ...attrs }: ButtonProps) {
  return (
    <button
      type="button"
      data-type={variant}
      {...attrs}
      class={cls(styles.button, attrs.class)}
    />
  )
}
