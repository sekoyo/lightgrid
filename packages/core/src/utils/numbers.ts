export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max)

export const toNearestHalf = (n: number) => Math.round(n / 0.5) * 0.5
