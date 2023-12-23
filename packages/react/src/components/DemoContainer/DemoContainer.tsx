import styles from './DemoContainer.module.css'

interface DemoContainerProps {
  height: string
  children?: React.ReactNode
}

export function DemoContainer({ children, height }: DemoContainerProps) {
  return (
    <div className={styles.container} style={{ height }}>
      {children}
    </div>
  )
}
