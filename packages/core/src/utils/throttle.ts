export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait = 20,
  immediate?: boolean
) {
  let previous = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  const throttledFn = function (this: any, ...args) {
    if (immediate) {
      const now = Date.now()

      if (now - previous > wait) {
        func.apply(this, args)
        previous = now
      }
    } else {
      if (!timer) {
        timer = setTimeout(() => {
          timer = null
          func.apply(this, args)
        }, wait)
      }
    }
  } as T & { cancel: () => void }

  throttledFn.cancel = () => {
    if (timer) {
      clearTimeout(timer)
    }
  }

  return throttledFn
}
