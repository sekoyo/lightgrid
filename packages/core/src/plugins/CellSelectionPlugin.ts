import { GridManager } from '../GridManager'
import { GridPlugin } from '../GridPlugin'
import { CellPosition, CellSelection } from '../types'

export class CellSelectionPlugin<T, R> extends GridPlugin<T, R> {
  rect?: DOMRect

  startCell?: CellPosition
  setStartCell: (pos: CellPosition | undefined) => void

  selection?: CellSelection
  setSelection: (sel: CellSelection | undefined) => void

  constructor(
    mgr: GridManager<T, R>,
    setStartCell: (pos: CellPosition | undefined) => void,
    setSelection: (sel: CellSelection | undefined) => void
  ) {
    super(mgr)
    this.setStartCell = (cell: CellPosition | undefined) => {
      this.startCell = cell
      setStartCell(cell)
    }
    this.setSelection = (sel: CellSelection | undefined) => {
      this.selection = sel
      setSelection(sel)
    }
  }

  mount() {
    this.mgr.scrollEl!.addEventListener('mousedown', this.onMouseDown)
    this.mgr.scrollEl!.addEventListener('mouseup', this.onMouseUp)
  }

  unmount() {
    this.mgr.scrollEl!.removeEventListener('mousedown', this.onMouseDown)
    this.mgr.scrollEl!.removeEventListener('mousemove', this.onMouseMove)
    this.mgr.scrollEl!.removeEventListener('mouseup', this.onMouseUp)
  }

  onMouseDown = (e: MouseEvent) => {
    this.rect = this.mgr.scrollEl!.getBoundingClientRect()
    const startWindowX = e.clientX - this.rect.left
    const startWindowY = e.clientY - this.rect.top

    if (this.isInSelectableArea(startWindowX, startWindowY)) {
      const area = this.getAreaFromPoint(startWindowX, startWindowY)

      if (area) {
        const startCell = this.getCellInAreaFromPoint(area, startWindowX, startWindowY)
        this.setStartCell(startCell)
        this.setSelection({
          rowRange: [startCell.rowIndex, startCell.rowIndex],
          colRange: [startCell.colIndex, startCell.colIndex],
        })
        this.mgr.scrollEl!.addEventListener('mousemove', this.onMouseMove, {
          passive: true,
        })
      }
    }
  }

  onMouseMove = (e: MouseEvent) => {
    const endWindowX = e.clientX - this.rect!.left
    const endWindowY = e.clientY - this.rect!.top
    const endArea = this.getAreaFromPoint(endWindowX, endWindowY)
    if (endArea) {
      const startCell = this.startCell!
      const endCell = this.getCellInAreaFromPoint(endArea, endWindowX, endWindowY)
      const lowRowIndex = Math.min(startCell.rowIndex, endCell.rowIndex)
      const highRowIndex = Math.max(startCell.rowIndex, endCell.rowIndex)
      const lowColIndex = Math.min(startCell.colIndex, endCell.colIndex)
      const highColIndex = Math.max(startCell.colIndex, endCell.colIndex)
      this.setSelection({
        rowRange: [lowRowIndex, highRowIndex],
        colRange: [lowColIndex, highColIndex],
      })
    }
  }

  onMouseUp = (e: MouseEvent) => {
    this.mgr.scrollEl!.removeEventListener('mousemove', this.onMouseMove)
  }

  isInSelectableArea = (windowX: number, windowY: number) =>
    windowX < this.mgr.$viewportWidth() - this.mgr.$scrollbarWidth() &&
    windowY > this.mgr.$headerHeight() &&
    windowY < this.mgr.$viewportHeight() - this.mgr.$scrollbarHeight()
}
