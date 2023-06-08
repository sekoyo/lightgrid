import { DerivedColResult, DerivedRowResult } from './types'

export enum AreaPin {
  x,
  y,
  xy,
}

interface GridAreaProps<T, R> {
  id: string
  pin?: AreaPin
  // The portion of the window/viewport this occupies
  windowX: number
  windowY: number
  windowWidth: number
  windowHeight: number
  width: number
  height: number
  colResult: DerivedColResult<T, R>
  rowResult: DerivedRowResult<T>
  pinnedX: boolean
  pinnedY: boolean
}

export class GridArea<T, R> {
  id: string
  pin?: AreaPin
  windowX: number
  windowY: number
  windowWidth: number
  windowHeight: number
  width: number
  height: number
  colResult: DerivedColResult<T, R>
  rowResult: DerivedRowResult<T>
  pinnedX: boolean
  pinnedY: boolean

  constructor(props: GridAreaProps<T, R>) {
    this.id = props.id
    this.pin = props.pin
    this.windowX = props.windowX
    this.windowY = props.windowY
    this.windowWidth = props.windowWidth
    this.windowHeight = props.windowHeight
    this.width = props.width
    this.height = props.height
    this.colResult = props.colResult
    this.rowResult = props.rowResult
    this.pinnedX = props.pinnedX
    this.pinnedY = props.pinnedY
  }
}
