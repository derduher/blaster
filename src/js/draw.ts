import Point2 from './Point2'
export function pathFromPoints (points:Point2[], closePath = true) {
  const path = new Path2D()
  const firstPoint = points[0]
  path.moveTo(firstPoint.x, firstPoint.y)
  for (let point of points) {
    if (point === firstPoint) {
      continue
    }
    path.lineTo(point.x, point.y)
  }
  if (closePath) {
    path.lineTo(firstPoint.x, firstPoint.y)
  }
  return path
}

export function pathFromSegments (segments: Array<Point2[]>) {
  const path = new Path2D()

  for (let points of segments) {
    path.addPath(pathFromPoints(points))
  }

  return path
}
