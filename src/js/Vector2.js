export default class Vector2 {
  constructor (x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  dot (b) {
    return this.x * b.x + this.y * b.y
  }

  cross (b) {
    return this.x * b.y - this.y * b.x
  }
}
