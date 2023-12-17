import styles from './GhostButton.module.scss'

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number
}

export function GhostButton(attrs: IconButtonProps) {
  return (
    <button
      {...attrs}
      className={`${styles.btn} ${attrs.className}`}
    />
  )
}
