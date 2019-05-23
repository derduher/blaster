import Geo from './Geo'
export default class Vector2 {
  public constructor (public x: number = 0, public y: number = 0) {}

  public dot (b: Vector2): number {
    return this.x * b.x + this.y * b.y
  }

  public cross (b: Vector2): number {
    return Geo.crossProduct(this, b)
  }
}
