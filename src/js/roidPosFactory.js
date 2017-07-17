import Vector2 from './Vector2'
import Point2 from './Point2'

export default function genPos (width, height) {
  return {
    pos: new Point2(Math.random() * width, -100),
    v: new Vector2(0.2 * (-0.5 + Math.random()), Math.random())
  }
}
