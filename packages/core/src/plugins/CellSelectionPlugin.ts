import { signal, effect } from '@maverick-js/signals'
import { AreaPos, CellPosition, CellSelection, Direction, GridAreaDesc } from '../types'
import { GridManager } from '../GridManager'
import { GridPlugin } from '../GridPlugin'
import { clamp, copySelection } from '../utils'

export class CellSelectionPlugin<T, R> extends GridPlugin<T, R> {
  rect?: DOMRect

  startArea?: GridAreaDesc<T, R>
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
      return cell
    }
    this.setSelection = (sel: CellSelection | undefined) => {
      this.selection = sel
      setSelection(sel)
      return sel
    }
  }

  mount() {
    this.mgr.gridEl!.addEventListener('keydown', this.onKeyDown)
    this.mgr.gridEl!.addEventListener('mousedown', this.onMouseDown)
  }

  unmount() {
    this.setStartCell(undefined)
    this.setSelection(undefined)
    this.mgr.gridEl!.removeEventListener('keydown', this.onKeyDown)
    this.mgr.gridEl!.removeEventListener('mousedown', this.onMouseDown)
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (!this.startCell || !this.selection) {
      return
    }

    if (e.metaKey) {
      const lowerKey = e.key.toLowerCase()
      if (lowerKey === 'c') {
        copySelection(this.selection, this.mgr.$derivedCols(), this.mgr.$derivedRows())
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
        this.scrollXNeeded(this.selection.colRange[0])
      } else if (e.key === 'ArrowRight') {
        if (e.shiftKey) {
          this.shiftChangeSelection(Direction.Right)
        } else {
          this.moveSelection(Direction.Right)
        }
        this.scrollXNeeded(this.selection.colRange[1])
      } else if (e.key === 'ArrowUp') {
        if (e.shiftKey) {
          this.shiftChangeSelection(Direction.Up)
        } else {
          this.moveSelection(Direction.Up)
        }
        this.scrollYNeeded(this.selection.rowRange[0])
      } else if (e.key === 'ArrowDown') {
        if (e.shiftKey) {
          this.shiftChangeSelection(Direction.Down)
        } else {
          this.moveSelection(Direction.Down)
        }
        this.scrollYNeeded(this.selection.rowRange[1])
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

  moveSelection(direction: Direction) {
    if (!this.startCell || !this.selection) {
      return
    }

    const startCell = { ...this.startCell }

    switch (direction) {
      case Direction.Up:
        startCell.rowIndex = Math.max(0, startCell.rowIndex - 1)
        break
      case Direction.Down:
        startCell.rowIndex = Math.min(
          startCell.rowIndex + 1,
          this.mgr.$derivedRows().itemCount - 1
        )
        break
      case Direction.Right:
        startCell.colIndex = Math.min(
          startCell.colIndex + 1,
          this.mgr.$derivedCols().itemCount - 1
        )
        break
      case Direction.Left:
        startCell.colIndex = Math.max(0, startCell.colIndex - 1)
        break
    }

    this.setStartCell(startCell)
    this.setSelection({
      rowRange: [startCell.rowIndex, startCell.rowIndex],
      colRange: [startCell.colIndex, startCell.colIndex],
    })
  }

  scrollXNeeded(colIndex: number) {
    const colResult = this.getColResultFromIndex(colIndex)

    // Don't scroll unless scrollable area
    if (colResult.areaPos !== AreaPos.Middle) {
      return
    }

    const scrollX = this.mgr.$scrollX()
    const relativeColIndex = colIndex - colResult.items[0].colIndex
    const col = colResult.items[relativeColIndex]
    const startSize = this.mgr.$derivedCols().start.size
    const endSize = this.mgr.$derivedCols().end.size

    if (col.offset - scrollX < 0) {
      this.mgr.scrollLeft(col.offset)
      return
    }

    // This seems a bit complex, is there a better way?
    const scrollbarWidth = this.mgr.$scrollbarWidth()
    const mainXWidth = this.mgr.$viewportWidth() - (startSize + endSize)
    const colEndY = scrollbarWidth + col.offset + col.size - scrollX

    if (colEndY > mainXWidth) {
      const areaOutlineWidth = 1
      this.mgr.scrollLeft(
        scrollbarWidth + col.offset + col.size + areaOutlineWidth - mainXWidth
      )
    }
  }

  scrollYNeeded(rowIndex: number) {
    const rowResult = this.getRowResultFromIndex(rowIndex)

    // Don't scroll unless scrollable area
    if (rowResult.areaPos !== AreaPos.Middle) {
      return
    }

    const scrollY = this.mgr.$scrollY()
    const relativeRowIndex = rowIndex - rowResult.items[0].rowIndex
    const row = rowResult.items[relativeRowIndex]
    const startSize = this.mgr.$derivedRows().start.size
    const endSize = this.mgr.$derivedRows().end.size

    if (row.offset - scrollY < 0) {
      this.mgr.scrollTop(row.offset)
      return
    }

    // This seems a bit complex, is there a better way?
    const scrollbarHeight = this.mgr.$scrollbarHeight()
    const mainYHeight =
      this.mgr.$viewportHeight() - (this.mgr.$headerHeight() + startSize + endSize)
    const rowEndY = scrollbarHeight + row.offset + row.size - scrollY

    if (rowEndY > mainYHeight) {
      const areaOutlineHeight = 1
      this.mgr.scrollTop(
        scrollbarHeight + row.offset + row.size + areaOutlineHeight - mainYHeight
      )
    }
  }
}
