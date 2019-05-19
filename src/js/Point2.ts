import { PointLike } from './types'
export default class Point2 implements PointLike {
  constructor (public x: number = 0, public y: number = 0) {}
}
