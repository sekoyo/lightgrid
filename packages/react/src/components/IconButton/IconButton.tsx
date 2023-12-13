import './IconButton.scss'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number
}

export function IconButton({ size, ...attrs }: IconButtonProps) {
  return (
    <button
      {...attrs}
      className={`lfg-icon-btn ${attrs.className}`}
      style={
        size || attrs.style
          ? {
              width: size,
              height: size,
              ...attrs.style,
            }
          : undefined
      }
    />
  )
}
