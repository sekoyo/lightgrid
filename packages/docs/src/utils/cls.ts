export function cls(...args: unknown[]) {
  return args.filter(v => v && typeof v === 'string').join(' ')
}
