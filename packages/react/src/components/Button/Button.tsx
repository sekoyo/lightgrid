import { cls } from '@lightfin/datagrid'
import styles from './Button.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', ...attrs }: ButtonProps) {
  return (
    <button
      type="button"
      data-type={variant}
      {...attrs}
      className={cls(styles.button, attrs.className)}
    />
  )
}
