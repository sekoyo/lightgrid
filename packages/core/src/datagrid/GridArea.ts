import { DerivedColResult, DerivedRowResult } from './utils'

export enum AreaPin {
  x,
  y,
  xy,
}

interface GridAreaProps<T, R> {
  id: string
  pin?: AreaPin
  // Absolute position as if elements are laid out on a large grid
  absX: number
  absY: number
  // The portion of the window/viewport this occupies
  windowX: number
  windowY: number
  windowWidth: number
  windowHeight: number
  colResult: DerivedColResult<T, R>
  rowResult: DerivedRowResult<T>
}

export class GridArea<T, R> {
  id: string
  pin?: AreaPin
  absX: number
  absY: number
  windowX: number
  windowY: number
  colResult: DerivedColResult<T, R>
  rowResult: DerivedRowResult<T>

  constructor(props: GridAreaProps<T, R>) {
    this.id = props.id
    this.pin = props.pin
    this.absX = props.absX
    this.absY = props.absY
    this.windowX = props.windowX
    this.windowY = props.windowY
    this.colResult = props.colResult
    this.rowResult = props.rowResult
  }
}
