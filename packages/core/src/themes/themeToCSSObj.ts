import { Theme } from './types'

export function themeToCSSObj(theme: Theme) {
  return Object.entries(theme).reduce((o, [k, v]) => {
    o[`--lfg${k[0].toUpperCase() + k.substring(1)}`] = v
    return o
  }, {} as Record<string, string | number>)
}
