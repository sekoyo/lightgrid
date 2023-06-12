import { GridManager } from '../GridManager'
import { GridPlugin } from '../GridPlugin'
import { CellPosition, CellSelection } from '../types'

export class CellSelectionPlugin<T, R> extends GridPlugin<T, R> {
  startWindowX = 0
  startWindowY = 0
  endWindowX = 0
  endWindowY = 0

  constructor(
    mgr: GridManager<T, R>,
    setStartCell: (pos: CellPosition | undefined) => void,
    setSelection: (sel: CellSelection | undefined) => void
  ) {
    super(mgr)
  }

  mount() {
    this.mgr.gridEl!.addEventListener('mousedown', this.onMouseDown)
    this.mgr.gridEl!.addEventListener('mouseup', this.onMouseUp)
  }

  unmount() {
    this.mgr.gridEl!.removeEventListener('mousemove', this.onMouseMove)
  }

  onMouseDown = (e: MouseEvent) => {
    console.log('onMouseDown', e.clientX, e.clientY)
    const rect = this.mgr.gridEl!.getBoundingClientRect()
    this.startWindowX = e.clientX - rect.left
    this.startWindowY = e.clientY - rect.top
    if (this.isInSelectableArea(this.startWindowX, this.startWindowY)) {
      // const absX = windowX + this.$scrollX()
      // const absY = windowY + this.$scrollY()
      this.mgr.gridEl!.addEventListener('mousemove', this.onMouseMove, {
        passive: true,
      })
    }
  }

  onMouseMove = (e: MouseEvent) => {
    console.log('onMouseMove')
  }

  onMouseUp = (e: MouseEvent) => {
    console.log('onMouseUp')
    this.mgr.gridEl!.removeEventListener('mousemove', this.onMouseMove)
  }

  isInSelectableArea = (windowX: number, windowY: number) =>
    windowX < this.mgr.$viewportWidth() - this.mgr.$scrollbarWidth() &&
    windowY > this.mgr.$headerHeight() &&
    windowY < this.mgr.$viewportHeight() - this.mgr.$scrollbarHeight()
}
