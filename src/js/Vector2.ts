export default class Vector2 {
  x: number
  y: number
  constructor (x = 0 , y = 0) {
    this.x = x
    this.y = y
  }

  dot (b: Vector2) : number {
    return this.x * b.x + this.y * b.y
  }

  cross (b: Vector2) : number {
    return this.x * b.y - this.y * b.x
  }
}
