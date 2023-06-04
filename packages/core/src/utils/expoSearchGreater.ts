export function expoSearchGreater<T>(
  items: T[],
  findValue: number,
  getValue: (item: T) => number,
  initialStep: number,
  from = 0,
  to = items.length - 1
) {
  let step = initialStep

  for (let i = from; i <= to; i += step) {
    if (findValue < getValue(items[i])) {
      return i
    }
    step *= 2
  }
}
