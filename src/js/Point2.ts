import { PointLike } from './types'
export default class Point2 implements PointLike {
  x: number
  y: number
  constructor (x = 0, y = 0) {
    this.x = x
    this.y = y
  }
}
