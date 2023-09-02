import { cls } from '@lightfin/datagrid'
import styles from './Button.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonType?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ buttonType = 'primary', ...attrs }: ButtonProps) {
  return (
    <button
      type="button"
      data-type={buttonType}
      {...attrs}
      className={cls(styles.button, attrs.className)}
    />
  )
}
