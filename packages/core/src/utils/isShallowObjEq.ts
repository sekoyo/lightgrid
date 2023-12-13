export function isShallowObjEq<T extends object>(v: T, o: T) {
  if (typeof v === 'object') {
    for (const key in v) if (!(key in o) || v[key] !== o[key]) return false

    for (const key in o) if (!(key in v) || v[key] !== o[key]) return false
  }
  return v === o
}
