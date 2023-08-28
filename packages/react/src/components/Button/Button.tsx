import { cls } from '@lightfin/datagrid'
import styles from './Button.module.css'

export function Button(attrs: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...attrs} className={cls(styles.button, attrs.className)} />
  )
}
