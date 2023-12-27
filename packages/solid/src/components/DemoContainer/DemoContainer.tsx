import { JSX } from 'solid-js'
import styles from './DemoContainer.module.css'

interface DemoContainerProps {
  height: string
  children?: JSX.Element
}

export function DemoContainer({ children, height }: DemoContainerProps) {
  return (
    <div class={styles.container} style={{ height }}>
      {children}
    </div>
  )
}
