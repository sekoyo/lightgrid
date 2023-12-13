// https://stackoverflow.com/a/59904874/414062
export class MapMap<Ka, Kb, V> implements Iterable<[Ka, Kb, V]> {
  readonly mm = new Map<Ka, Map<Kb, V>>()

  get(a: Ka, b: Kb): V | undefined {
    const m = this.mm.get(a)
    if (m !== undefined) {
      return m.get(b)
    }
    return undefined
  }

  set(a: Ka, b: Kb, v: V): void {
    let m = this.mm.get(a)
    if (m === undefined) {
      this.mm.set(a, (m = new Map()))
    }
    m.set(b, v)
  }

  *[Symbol.iterator](): Iterator<[Ka, Kb, V]> {
    for (const [a, m] of this.mm) {
      for (const [b, v] of m) {
        yield [a, b, v]
      }
    }
  }
}
