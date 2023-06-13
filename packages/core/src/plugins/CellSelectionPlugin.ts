import { GridManager } from '../GridManager'
import { GridPlugin } from '../GridPlugin'
import { CellPosition, CellSelection, GridArea } from '../types'

export class CellSelectionPlugin<T, R> extends GridPlugin<T, R> {
  startWindowX = 0
  startWindowY = 0
  endWindowX = 0
  endWindowY = 0
  rect?: DOMRect
  startArea?: GridArea<T, R> | undefined
  setStartCell: (pos: CellPosition | undefined) => void
  setSelection: (pos: CellSelection | undefined) => void

  constructor(
    mgr: GridManager<T, R>,
    setStartCell: (pos: CellPosition | undefined) => void,
    setSelection: (sel: CellSelection | undefined) => void
  ) {
    super(mgr)
    this.setStartCell = setStartCell
    this.setSelection = setSelection
  }

  mount() {
    this.mgr.gridEl!.addEventListener('mousedown', this.onMouseDown)
    this.mgr.gridEl!.addEventListener('mouseup', this.onMouseUp)
  }

  unmount() {
    this.mgr.gridEl!.removeEventListener('mousedown', this.onMouseDown)
    this.mgr.gridEl!.removeEventListener('mousemove', this.onMouseMove)
    this.mgr.gridEl!.removeEventListener('mouseup', this.onMouseUp)
  }

  onMouseDown = (e: MouseEvent) => {
    this.rect = this.mgr.gridEl!.getBoundingClientRect()
    this.startWindowX = e.clientX - this.rect.left
    this.startWindowY = e.clientY - this.rect.top

    if (this.isInSelectableArea(this.startWindowX, this.startWindowY)) {
      this.startArea = this.getAreaFromPoint(this.startWindowX, this.startWindowY)

      if (this.startArea) {
        const cell = this.getCellInAreaFromPoint(
          this.startArea,
          this.startWindowX,
          this.startWindowY
        )
        this.setStartCell(cell)
        this.mgr.gridEl!.addEventListener('mousemove', this.onMouseMove, {
          passive: true,
        })
      }
    }
  }

  onMouseMove = (e: MouseEvent) => {
    this.endWindowX = e.clientX - this.rect!.left
    this.endWindowY = e.clientY - this.rect!.top
  }

  onMouseUp = (e: MouseEvent) => {
    this.mgr.gridEl!.removeEventListener('mousemove', this.onMouseMove)
  }

  isInSelectableArea = (windowX: number, windowY: number) =>
    windowX < this.mgr.$viewportWidth() - this.mgr.$scrollbarWidth() &&
    windowY > this.mgr.$headerHeight() &&
    windowY < this.mgr.$viewportHeight() - this.mgr.$scrollbarHeight()
}
