import Vector2 from './Vector2'
import Point2 from './Point2'
import { BoundingBox, PointLike } from './types'
import Obj from './Object'
import { GenPos } from './roidPosFactory'

export default class Geo implements GenPos {
  pos: Point2
  v: Vector2
  acc: Vector2
  points: Point2[]
  treatAsPoint: boolean
  aabb: BoundingBox
  constructor (x = 0, y = 0, dx = 0, dy = 0, ax = 0, ay = 0) {
    this.pos = new Point2(x, y)
    this.v = new Vector2(dx, dy)
    this.acc = new Vector2(ax, ay)
    this.points = []
    this.aabb = { min: new Point2(), max: new Point2() }
    this.treatAsPoint = false
  }

  // A^2 + B^2 = C^2
  distanceTo (pos: Point2): number {
    return Math.sqrt(Math.pow(pos.x - this.pos.x, 2) + Math.pow(pos.y - this.pos.y, 2))
  }

  distanceToObj (obj: Obj): number {
    return this.distanceTo(obj.geo.pos)
  }
  // This can probably be simplified.
  aabbIntersects (b: Geo):boolean {
    let left // the object that is the most to the left
    let right
    let top
    let bottom
    if (this.pos.x + this.aabb.min.x < b.pos.x + b.aabb.min.x) {
      left = this
      right = b
    } else {
      left = b
      right = this
    }

    if (this.pos.y + this.aabb.min.y < b.pos.y + b.aabb.min.y) {
      top = this
      bottom = b
    } else {
      top = b
      bottom = this
    }

    return right.aabb.min.x < left.aabb.max.x &&
      bottom.aabb.min.y < top.aabb.max.y
  }

  // http://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
  static crossProduct (a: Vector2|Point2, b: Vector2|Point2) : number {
    return a.x * b.y - b.x * a.y
  }

  static isPointOnLine (aa: Point2, ab: Point2, b: Point2): boolean {
    const aTmp:Point2 = new Point2(ab.x - aa.x, ab.y - aa.y)
    const bTmp:Point2 = new Point2(b.x - aa.x, b.y - aa.y)
    return Math.abs(Geo.crossProduct(aTmp, bTmp)) < Number.EPSILON
  }

  static isPointRightOfLine (aa: Point2, ab: Point2, b: Point2) : boolean {
    // Move the image, so that a.first is on (0|0)
    const aTmp:Point2 = new Point2(ab.x - aa.x, ab.y - aa.y)
    const bTmp:Point2 = new Point2(b.x - aa.x, b.y - aa.y)
    return Geo.crossProduct(aTmp, bTmp) < 0
  }

  static segmentTouchesOrCrosses (aa: Point2, ab: Point2, ba: Point2, bb: Point2) : boolean {
    return Geo.isPointOnLine(aa, ab, ba) ||
    Geo.isPointOnLine(aa, ab, bb) || (
      Geo.isPointRightOfLine(aa, ab, ba) !==
    Geo.isPointRightOfLine(aa, ab, bb)
    )
  }

  static getSegmentBB (a: Point2, b: Point2) {
    return [new Point2(Math.min(a.x, b.x), Math.min(a.y, b.y)), new Point2(Math.max(a.x, b.x), Math.max(a.y, b.y))]
  }

  static segmentsBBIntersect (aa: Point2, ab: Point2, ba: Point2, bb: Point2): boolean {
    var firstbb = Geo.getSegmentBB(aa, ab)
    var secondbb = Geo.getSegmentBB(ba, bb)
    return firstbb[0].x <= secondbb[1].x &&
    firstbb[1].x >= secondbb[0].x &&
    firstbb[0].y <= secondbb[1].y &&
    firstbb[1].y >= secondbb[0].y
  }

  static segmentsIntersect (aa: Point2, ab: Point2, ba: Point2, bb: Point2): boolean {
    return Geo.segmentsBBIntersect(aa, ab, ba, bb) &&
    Geo.segmentTouchesOrCrosses(aa, ab, ba, bb) &&
    Geo.segmentTouchesOrCrosses(ba, bb, aa, ab)
  }

  static pointsAtPos (points: Point2[], pos: Point2): Point2[] {
    var i
    var atPos = []
    for (i = 0; i < points.length; i++) {
      atPos[i] = new Point2(points[i].x + pos.x, points[i].y + pos.y)
    }
    return atPos
  }

  intersectsWith (ogeo: Geo): boolean {
    var i
    var oi
    var collision = false
    var points
    var opoints
    var point
    var prev
    var polyPos
    var oprev

    if (!this.aabbIntersects(ogeo)) {
      return false
    } else if (this.treatAsPoint || ogeo.treatAsPoint) {
      // o.highlight('green')
      // game._pause()
      if (this.treatAsPoint) {
        point = this
        polyPos = ogeo.pos
        points = ogeo.points
      } else {
        point = ogeo
        points = this.points
        polyPos = this.pos
      }
      point = new Point2(point.pos.x + point.aabb.max.x / 2, point.pos.y + point.aabb.max.y / 2)
      // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
      for (i = 0, prev = points.length - 1; i < points.length; prev = i++) {
        if (((polyPos.y + points[i].y > point.y) !== (polyPos.y + points[prev].y > point.y)) &&
          (point.x < (points[prev].x - points[i].x) * (point.y - (polyPos.y + points[i].y)) / (points[prev].y - points[i].y) + polyPos.x + points[i].x)) {
          collision = !collision
        }
      }
    } else {
      points = Geo.pointsAtPos(this.points, this.pos)
      opoints = Geo.pointsAtPos(ogeo.points, ogeo.pos)
      for (i = 0, prev = points.length - 1; i < points.length; prev = i++) {
        for (oi = 0, oprev = opoints.length - 1; oi < opoints.length; oprev = oi++) {
          if (Geo.segmentsIntersect(points[i], points[prev], opoints[oi], opoints[oprev])) {
            collision = true
            break
          }
        }
        if (collision) {
          break
        }
      }
    }
    return collision
  }
}
