import { type GridManager } from './GridManager'

export abstract class GridPlugin<T, R> {
  mgr: GridManager<T, R>

  constructor(mgr: GridManager<T, R>) {
    this.mgr = mgr
  }
  mount?(): void
  unmount?(): void
  onResize?(width: number, height: number): void
}
