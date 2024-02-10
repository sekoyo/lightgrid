import { canUseDOM } from '../constants'

export function getScrollBarSize() {
  if (!canUseDOM) {
    return 0
  }
  const el = document.createElement('div')
  const mql = window.matchMedia('@media (hover: hover) and (pointer: fine)')
  // Only add the class which affect scrollbar width on desktop. If added on
  // mobile we get a width.
  if (mql.matches) {
    el.classList.add('lg-scroll')
  }
  el.style.setProperty('overflow', 'scroll')
  el.style.setProperty('visibility', 'hidden')
  el.style.setProperty('position', 'absolute')
  document.body.appendChild(el)
  const width = el.offsetWidth - el.clientWidth
  el.remove()
  return width
}
