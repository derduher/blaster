import Point2 from "./Point2";
export function pathFromPoints(points: Point2[], closePath = true): Path2D {
  const path = new Path2D();
  const firstPoint = points[0];
  path.moveTo(firstPoint.x, firstPoint.y);
  for (const point of points) {
    if (point === firstPoint) {
      continue;
    }
    path.lineTo(point.x, point.y);
  }
  if (closePath) {
    path.lineTo(firstPoint.x, firstPoint.y);
  }
  return path;
}

export function pathFromSegments(segments: Point2[][]): Path2D {
  const path = new Path2D();

  for (const points of segments) {
    path.addPath(pathFromPoints(points));
  }

  return path;
}
