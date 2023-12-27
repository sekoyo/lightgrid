import { For, type JSX } from 'solid-js'
import { cls } from '@lightfin/datagrid'
import styles from './Select.module.css'

interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>
}

export function Select({ options, ...attrs }: SelectProps) {
  return (
    <select {...attrs} class={cls(styles.select, attrs.class)}>
      <For each={options}>
        {option => <option value={option.value}>{option.label}</option>}
      </For>
    </select>
  )
}
