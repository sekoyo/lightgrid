import { cls } from '@lightfin/datagrid'
import styles from './Input.module.css'

export function Input(attrs: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...attrs} className={cls(styles.input, attrs.className)} />
}
