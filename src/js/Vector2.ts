import Point2 from "./Point2";

export default class Vector2 extends Point2 {
  public dot(b: Vector2): number {
    return this.x * b.x + this.y * b.y;
  }

  public cross(b: Vector2): number {
    return this.x * b.y - b.x * this.y;
  }
}
