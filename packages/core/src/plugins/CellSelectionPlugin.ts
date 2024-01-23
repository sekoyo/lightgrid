import { signal, effect } from '@preact/signals-core'
import {
  AreaPos,
  CellPosition,
  CellSelection,
  Direction,
  BodyAreaDesc,
} from '../types'
import { GridManager } from '../GridManager'
import { GridPlugin } from '../GridPlugin'
import { clamp, copySelection } from '../utils'

export class CellSelectionPlugin<T, N> extends GridPlugin<T, N> {
  rect?: DOMRect

  startArea?: BodyAreaDesc<T, N>
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
    mgr: GridManager<T, N>,
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
    window.addEventListener('keydown', this.onWindowKeyDown)
    this.mgr.gridEl!.addEventListener('keydown', this.onKeyDown)
    this.mgr.gridEl!.addEventListener('mousedown', this.onMouseDown)
  }

  unmount() {
    this.setStartCell(undefined)
    this.setSelection(undefined)
    window.removeEventListener('keydown', this.onWindowKeyDown)
    this.mgr.gridEl!.removeEventListener('keydown', this.onKeyDown)
    this.mgr.gridEl!.removeEventListener('mousedown', this.onMouseDown)
    window.removeEventListener('mousemove', this.onWindowMouseMove)
    window.removeEventListener('mouseup', this.onWindowMouseUp)
  }

  onWindowKeyDown = (e: KeyboardEvent) => {
    if (!this.startCell || !this.selection) {
      return
    }

    // Don't scroll the window
    if (e.key.startsWith('Arrow')) {
      e.preventDefault()
    }
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (!this.startCell || !this.selection) {
      return
    }

    if (e.metaKey) {
      const lowerKey = e.key.toLowerCase()
      if (lowerKey === 'c') {
        copySelection(
          this.selection,
          this.mgr.$derivedCols.value,
          this.mgr.$derivedRows.value
        )
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
      this.startArea = this.getBodyAreaFromPoint(startWindowX, startWindowY)

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
        window.addEventListener('mousemove', this.onWindowMouseMove, {
          passive: true,
        })
        window.addEventListener('mouseup', this.onWindowMouseUp, {
          passive: true,
        })
      }
    }
  }

  onWindowMouseMove = (e: MouseEvent) => {
    const endWindowX = e.clientX - this.rect!.left
    const endWindowY = e.clientY - this.rect!.top
    const endArea = this.getBodyAreaFromPoint(endWindowX, endWindowY)

    if (endArea) {
      // Selection area
      const startCell = this.startCell!
      const endCell = this.getCellInAreaFromPoint(
        endArea,
        endWindowX,
        endWindowY
      )
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
        this.$autoScrollX.value = true
      } else if (endWindowX > startArea.windowX + startArea.windowWidth) {
        // Right
        this.scrollXStep =
          (endWindowX - (startArea.windowX + startArea.windowWidth)) *
          this.stepFactor
        this.$autoScrollX.value = true
      } else {
        this.$autoScrollX.value = false
      }
    }

    // Auto scroll Y
    if (!startArea.pinnedY) {
      if (endWindowY < startArea.windowY) {
        // Up
        this.scrollYStep = (endWindowY - startArea.windowY) * this.stepFactor
        this.$autoScrollY.value = true
      } else if (endWindowY > startArea.windowY + startArea.windowHeight) {
        // Down
        this.scrollYStep =
          (endWindowY - (startArea.windowY + startArea.windowHeight)) *
          this.stepFactor
        this.$autoScrollY.value = true
      } else {
        this.$autoScrollY.value = false
      }
    }
  }

  onWindowMouseUp = () => {
    this.$autoScrollX.value = false
    this.$autoScrollY.value = false
    window.removeEventListener('mouseup', this.onWindowMouseUp)
    window.removeEventListener('mousemove', this.onWindowMouseMove)
  }

  isInSelectableArea = (windowX: number, windowY: number) =>
    windowX <
      this.mgr.$viewportWidth.value - this.mgr.$horizontalScrollSize.value &&
    windowY > this.mgr.$headerHeight.value &&
    windowY <
      this.mgr.$viewportHeight.value - this.mgr.$horizontalScrollSize.value

  scrollX = effect(() => {
    if (this.$autoScrollX.value) {
      const id = setInterval(() => {
        const maxScroll =
          this.mgr.$derivedCols.value.size -
          (this.mgr.$viewportWidth.value - this.mgr.$horizontalScrollSize.value)
        const scrollLeft = clamp(
          this.mgr.$scrollX.value + this.scrollXStep,
          0,
          maxScroll
        )
        this.mgr.$scrollX.value = scrollLeft
        this.mgr.scrollLeft(scrollLeft)
      }, 10)
      return () => clearInterval(id)
    }
  })

  scrollY = effect(() => {
    if (this.$autoScrollY.value) {
      const id = setInterval(() => {
        const maxScroll =
          this.mgr.$derivedRows.value.size -
          (this.mgr.$viewportHeight.value -
            this.mgr.$horizontalScrollSize.value)
        const scrollTop = clamp(
          this.mgr.$scrollY.value + this.scrollYStep,
          0,
          maxScroll
        )
        this.mgr.$scrollY.value = scrollTop
        this.mgr.scrollTop(scrollTop)
      }, 10)
      return () => clearInterval(id)
    }
  })

  selectAll() {
    this.setSelection({
      colRange: [0, this.mgr.$derivedCols.value.itemCount - 1],
      rowRange: [0, this.mgr.$derivedRows.value.itemCount - 1],
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
              Math.max(
                this.selection.rowRange[0],
                this.selection.rowRange[1] - 1
              ),
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
                this.mgr.$derivedRows.value.itemCount - 1
              ),
            ],
          })
        } else {
          // Shrink from top
          this.setSelection({
            colRange: this.selection.colRange,
            rowRange: [
              Math.min(
                this.selection.rowRange[0] + 1,
                this.selection.rowRange[1]
              ),
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
                this.mgr.$derivedCols.value.itemCount - 1
              ),
            ],
            rowRange: this.selection.rowRange,
          })
        } else {
          // Shring from left
          this.setSelection({
            colRange: [
              Math.min(
                this.selection.colRange[0] + 1,
                this.selection.colRange[1]
              ),
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
              Math.max(
                this.selection.colRange[1] - 1,
                this.selection.colRange[0]
              ),
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
          this.mgr.$derivedRows.value.itemCount - 1
        )
        break
      case Direction.Right:
        startCell.colIndex = Math.min(
          startCell.colIndex + 1,
          this.mgr.$derivedCols.value.itemCount - 1
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

    const scrollX = this.mgr.$scrollX.value
    const relativeColIndex = colIndex - colResult.items[0].colIndex
    const col = colResult.items[relativeColIndex]
    const startSize = this.mgr.$derivedCols.value.start.size
    const endSize = this.mgr.$derivedCols.value.end.size

    if (col.offset - scrollX < 0) {
      this.mgr.scrollLeft(col.offset)
      return
    }

    // This seems a bit complex, is there a better way?
    const scrollbarWidth = this.mgr.$horizontalScrollSize.value
    const mainXWidth = this.mgr.$viewportWidth.value - (startSize + endSize)
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

    const scrollY = this.mgr.$scrollY.value
    const relativeRowIndex = rowIndex - rowResult.items[0].rowIndex
    const row = rowResult.items[relativeRowIndex]
    const startSize = this.mgr.$derivedRows.value.start.size
    const endSize = this.mgr.$derivedRows.value.end.size

    if (row.offset - scrollY < 0) {
      this.mgr.scrollTop(row.offset)
      return
    }

    // This seems a bit complex, is there a better way?
    const scrollbarHeight = this.mgr.$horizontalScrollSize.value
    const mainYHeight =
      this.mgr.$viewportHeight.value -
      (this.mgr.$headerHeight.value + startSize + endSize)
    const rowEndY = scrollbarHeight + row.offset + row.size - scrollY

    if (rowEndY > mainYHeight) {
      const areaOutlineHeight = 1
      this.mgr.scrollTop(
        scrollbarHeight +
          row.offset +
          row.size +
          areaOutlineHeight -
          mainYHeight
      )
    }
  }
}
