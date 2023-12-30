import { splitProps, type JSX } from 'solid-js'
import { cls } from '@lightfin/datagrid'
import styles from './Button.module.css'

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button(props: ButtonProps) {
  const [local, attrs] = splitProps(props, ['variant', 'class'])

  return (
    <button
      type="button"
      {...attrs}
      data-type={local.variant || 'primary'}
      class={cls(styles.button, local.class)}
    />
  )
}
