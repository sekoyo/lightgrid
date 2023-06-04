import './IconButton.scss'

export function IconButton(attrs: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...attrs} className={`lfg-icon-btn ${attrs.className}`} />
}
