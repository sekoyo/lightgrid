import { cls } from '@lightgrid/core'
import styles from './Select.module.css'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>
}

export function Select({ options, ...attrs }: SelectProps) {
  return (
    <select {...attrs} className={cls(styles.select, attrs.className)}>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
