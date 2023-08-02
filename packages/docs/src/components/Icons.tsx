import type { JSX } from 'solid-js'

export function DoubleArrowUp(attrs: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...attrs}>
      <path
        d="M16.71 15.29a1 1 0 0 0-1.42 0l-10 10a1 1 0 0 0 1.42 1.42l9.29-9.3 9.29 9.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42z"
        fill="currentColor"
      />
      <path
        d="M6.71 16.71 16 7.41l9.29 9.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-10-10a1 1 0 0 0-1.42 0l-10 10a1 1 0 0 0 1.42 1.42z"
        fill="currentColor"
      />
    </svg>
  )
}
