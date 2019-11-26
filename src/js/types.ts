import Point2 from "./Point2.js";
export interface PointLike {
  x: number;
  y: number;
}
export interface BoundingBox {
  min: Point2;
  max: Point2;
}
