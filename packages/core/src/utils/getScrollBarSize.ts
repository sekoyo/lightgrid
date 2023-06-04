import { canUseDOM } from '../constants'

export function getScrollBarSize() {
  if (!canUseDOM) {
    return 0
  }
  const el = document.createElement('div')
  el.classList.add('lfg-scroll')
  el.style.setProperty('overflow', 'scroll')
  el.style.setProperty('visibility', 'hidden')
  el.style.setProperty('position', 'absolute')
  document.body.appendChild(el)
  const width = el.offsetWidth - el.clientWidth
  el.remove()
  return width
}
