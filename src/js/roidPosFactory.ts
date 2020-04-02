import Vector2 from "./Vector2";
import Point2 from "./Point2";

export interface GenPos {
  pos: Point2;
  v: Vector2;
}

export default function genPos(width: number, height: number): GenPos {
  return {
    pos: new Point2(Math.random() * width, -100),
    v: new Vector2(0.2 * (-0.5 + Math.random()), Math.random()),
  };
}
