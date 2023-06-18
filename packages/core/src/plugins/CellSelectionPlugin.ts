import { signal, effect } from '@maverick-js/signals'
import { GridManager } from '../GridManager'
import { GridPlugin } from '../GridPlugin'
import { CellPosition, CellSelection, Direction, GridArea } from '../types'
import { clamp } from '../utils'

export class CellSelectionPlugin<T, R> extends GridPlugin<T, R> {
  rect?: DOMRect

  startArea?: GridArea<T, R>
  startCell?: CellPosition
  setStartCell: (pos: CellPosition | undefined) => void

  selection?: CellSelection
  setSelection: (sel: CellSelection | undefined) => void

  $autoScrollX = signal(false)
  $autoScrollY = signal(false)
  scrollXStep = 0
  scrollYStep = 0
  stepFactor = 0.1

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
    this.mgr.gridEl!.addEventListener('keydown', this.onKeyDown)
    this.mgr.gridEl!.addEventListener('mousedown', this.onMouseDown)
  }

  unmount() {
    this.mgr.gridEl!.removeEventListener('keydown', this.onKeyDown)
    this.mgr.gridEl!.removeEventListener('mousedown', this.onMouseDown)
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey) {
      const lowerKey = e.key.toLowerCase()
      if (lowerKey === 'c') {
        // copyToClipboard(selection, derivedCols, derivedRows)
        return
      } else if (lowerKey === 'a') {
        this.selectAll()
      }
    } else {
      if (e.key === 'ArrowLeft') {
        if (e.shiftKey) {
          this.shiftChangeSelection(Direction.Left)
        } else {
          this.moveSelection(Direction.Left)
        }
      } else if (e.key === 'ArrowRight') {
        if (e.shiftKey) {
          this.shiftChangeSelection(Direction.Right)
        } else {
          this.moveSelection(Direction.Right)
        }
      } else if (e.key === 'ArrowUp') {
        if (e.shiftKey) {
          this.shiftChangeSelection(Direction.Up)
        } else {
          this.moveSelection(Direction.Up)
        }
      } else if (e.key === 'ArrowDown') {
        if (e.shiftKey) {
          this.shiftChangeSelection(Direction.Down)
        } else {
          this.moveSelection(Direction.Down)
        }
      }
    }
  }

  onMouseDown = (e: MouseEvent) => {
    this.rect = this.mgr.gridEl!.getBoundingClientRect()
    const startWindowX = e.clientX - this.rect.left
    const startWindowY = e.clientY - this.rect.top

    if (this.isInSelectableArea(startWindowX, startWindowY)) {
      this.startArea = this.getAreaFromPoint(startWindowX, startWindowY)

      if (this.startArea) {
        const startCell = this.getCellInAreaFromPoint(
          this.startArea,
          startWindowX,
          startWindowY
        )
        this.setStartCell(startCell)
        this.setSelection({
          rowRange: [startCell.rowIndex, startCell.rowIndex],
          colRange: [startCell.colIndex, startCell.colIndex],
        })
        window.addEventListener('mousemove', this.onMouseMove, {
          passive: true,
        })
        window.addEventListener('mouseup', this.onMouseUp, {
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
      // Selection area
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

    const startArea = this.startArea!

    // Auto scroll X
    if (!startArea.pinnedX) {
      if (endWindowX < startArea.windowX) {
        // Left
        this.scrollXStep = (endWindowX - startArea.windowX) * this.stepFactor
        this.$autoScrollX.set(true)
      } else if (endWindowX > startArea.windowX + startArea.windowWidth) {
        // Right
        this.scrollXStep =
          (endWindowX - (startArea.windowX + startArea.windowWidth)) * this.stepFactor
        this.$autoScrollX.set(true)
      } else {
        this.$autoScrollX.set(false)
      }
    }

    // Auto scroll Y
    if (!startArea.pinnedY) {
      if (endWindowY < startArea.windowY) {
        // Up
        this.scrollYStep = (endWindowY - startArea.windowY) * this.stepFactor
        this.$autoScrollY.set(true)
      } else if (endWindowY > startArea.windowY + startArea.windowHeight) {
        // Down
        this.scrollYStep =
          (endWindowY - (startArea.windowY + startArea.windowHeight)) * this.stepFactor
        this.$autoScrollY.set(true)
      } else {
        this.$autoScrollY.set(false)
      }
    }
  }

  onMouseUp = () => {
    this.$autoScrollX.set(false)
    this.$autoScrollY.set(false)
    window.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('mousemove', this.onMouseMove)
  }

  isInSelectableArea = (windowX: number, windowY: number) =>
    windowX < this.mgr.$viewportWidth() - this.mgr.$scrollbarWidth() &&
    windowY > this.mgr.$headerHeight() &&
    windowY < this.mgr.$viewportHeight() - this.mgr.$scrollbarHeight()

  scrollX = effect(() => {
    if (this.$autoScrollX()) {
      const id = setInterval(() => {
        const maxScroll =
          this.mgr.$derivedCols().size -
          (this.mgr.$viewportWidth() - this.mgr.$scrollbarWidth())
        const scrollLeft = clamp(this.mgr.$scrollX() + this.scrollXStep, 0, maxScroll)
        this.mgr.$scrollX.set(scrollLeft)
        this.mgr.scrollLeft(scrollLeft)
      }, 10)
      return () => clearInterval(id)
    }
  })

  scrollY = effect(() => {
    if (this.$autoScrollY()) {
      const id = setInterval(() => {
        const maxScroll =
          this.mgr.$derivedRows().size -
          (this.mgr.$viewportHeight() - this.mgr.$scrollbarHeight())
        const scrollTop = clamp(this.mgr.$scrollY() + this.scrollYStep, 0, maxScroll)
        this.mgr.$scrollY.set(scrollTop)
        this.mgr.scrollTop(scrollTop)
      }, 10)
      return () => clearInterval(id)
    }
  })

  selectAll() {
    this.setSelection({
      colRange: [0, this.mgr.$derivedCols().itemCount - 1],
      rowRange: [0, this.mgr.$derivedRows().itemCount - 1],
    })
  }

  shiftChangeSelection(direction: Direction) {
    if (!this.startCell || !this.selection) {
      return
    }

    switch (direction) {
      case Direction.Up:
        if (this.startCell.rowIndex >= this.selection.rowRange[1]) {
          // Expand upwards
          this.setSelection({
            colRange: this.selection.colRange,
            rowRange: [
              Math.max(0, this.selection.rowRange[0] - 1),
              this.selection.rowRange[1],
            ],
          })
        } else {
          // Shrink from bottom
          this.setSelection({
            colRange: this.selection.colRange,
            rowRange: [
              this.selection.rowRange[0],
              Math.max(this.selection.rowRange[0], this.selection.rowRange[1] - 1),
            ],
          })
        }
        break
      case Direction.Down:
        if (this.startCell.rowIndex <= this.selection.rowRange[0]) {
          // Expand downwards
          this.setSelection({
            colRange: this.selection.colRange,
            rowRange: [
              this.selection.rowRange[0],
              Math.min(
                this.selection.rowRange[1] + 1,
                this.mgr.$derivedRows().itemCount - 1
              ),
            ],
          })
        } else {
          // Shrink from top
          this.setSelection({
            colRange: this.selection.colRange,
            rowRange: [
              Math.min(this.selection.rowRange[0] + 1, this.selection.rowRange[1]),
              this.selection.rowRange[1],
            ],
          })
        }
        break
      case Direction.Right:
        if (this.startCell.colIndex <= this.selection.colRange[0]) {
          // Expand right
          this.setSelection({
            colRange: [
              this.selection.colRange[0],
              Math.min(
                this.selection.colRange[1] + 1,
                this.mgr.$derivedCols().itemCount - 1
              ),
            ],
            rowRange: this.selection.rowRange,
          })
        } else {
          // Shring from left
          this.setSelection({
            colRange: [
              Math.min(this.selection.colRange[0] + 1, this.selection.colRange[1]),
              this.selection.colRange[1],
            ],
            rowRange: this.selection.rowRange,
          })
        }
        break
      case Direction.Left:
        if (this.startCell.colIndex >= this.selection.colRange[1]) {
          // Expand left
          this.setSelection({
            colRange: [
              Math.max(0, this.selection.colRange[0] - 1),
              this.selection.colRange[1],
            ],
            rowRange: this.selection.rowRange,
          })
        } else {
          // Shrink from right
          this.setSelection({
            colRange: [
              this.selection.colRange[0],
              Math.max(this.selection.colRange[1] - 1, this.selection.colRange[0]),
            ],
            rowRange: this.selection.rowRange,
          })
        }
        break
    }
  }

  moveSelection(direction: Direction) {}
}
