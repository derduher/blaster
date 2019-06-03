import Vector2 from './Vector2'
import Point2 from './Point2'
import { BoundingBox } from './types'
import Obj from './Object'
import { GenPos } from './roidPosFactory'

export default class Geo implements GenPos {
  public aabb: BoundingBox
  public treatAsPoint = false
  public constructor (
    public points: Point2[],
    public pos = new Point2(),
    public v = new Vector2(),
    public acc = new Vector2()
  ) {
    this.aabb = Geo.getBBForPoints(points)
  }

  public static getBBForPoints (points: Point2[]): BoundingBox {
    const iv: BoundingBox = { min: new Point2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY), max: new Point2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY) }
    return points.reduce(
      (aabb: BoundingBox, point: Point2): BoundingBox => {
        if (point.x < aabb.min.x) {
          aabb.min.x = point.x
        }

        if (point.y < aabb.min.y) {
          aabb.min.y = point.y
        }

        if (point.x > aabb.max.x) {
          aabb.max.x = point.x
        }

        if (point.y > aabb.max.y) {
          aabb.max.y = point.y
        }

        return aabb
      },
      iv
    )
  }

  // A^2 + B^2 = C^2
  public distanceTo (pos: Point2): number {
    return Math.sqrt(Math.pow(pos.x - this.pos.x, 2) + Math.pow(pos.y - this.pos.y, 2))
  }

  public distanceToObj (obj: Obj): number {
    return this.distanceTo(obj.geo.pos)
  }
  // This can probably be simplified.
  public aabbIntersects (b: Geo): boolean {
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
  public static crossProduct (a: Vector2|Point2, b: Vector2|Point2): number {
    return a.x * b.y - b.x * a.y
  }

  public static isPointOnLine (aa: Point2, ab: Point2, b: Point2): boolean {
    const aTmp: Point2 = new Point2(ab.x - aa.x, ab.y - aa.y)
    const bTmp: Point2 = new Point2(b.x - aa.x, b.y - aa.y)
    return Math.abs(Geo.crossProduct(aTmp, bTmp)) < Number.EPSILON
  }

  public static isPointRightOfLine (aa: Point2, ab: Point2, b: Point2): boolean {
    // Move the image, so that a.first is on (0|0)
    const aTmp: Point2 = new Point2(ab.x - aa.x, ab.y - aa.y)
    const bTmp: Point2 = new Point2(b.x - aa.x, b.y - aa.y)
    return Geo.crossProduct(aTmp, bTmp) < 0
  }

  public static segmentTouchesOrCrosses (aa: Point2, ab: Point2, ba: Point2, bb: Point2): boolean {
    return Geo.isPointOnLine(aa, ab, ba) ||
    Geo.isPointOnLine(aa, ab, bb) || (
      Geo.isPointRightOfLine(aa, ab, ba) !==
    Geo.isPointRightOfLine(aa, ab, bb)
    )
  }

  public static getSegmentBB (a: Point2, b: Point2): Point2[] {
    return [new Point2(Math.min(a.x, b.x), Math.min(a.y, b.y)), new Point2(Math.max(a.x, b.x), Math.max(a.y, b.y))]
  }

  public static segmentsBBIntersect (aa: Point2, ab: Point2, ba: Point2, bb: Point2): boolean {
    var firstbb = Geo.getSegmentBB(aa, ab)
    var secondbb = Geo.getSegmentBB(ba, bb)
    return firstbb[0].x <= secondbb[1].x &&
    firstbb[1].x >= secondbb[0].x &&
    firstbb[0].y <= secondbb[1].y &&
    firstbb[1].y >= secondbb[0].y
  }

  public static segmentsIntersect (aa: Point2, ab: Point2, ba: Point2, bb: Point2): boolean {
    return Geo.segmentsBBIntersect(aa, ab, ba, bb) &&
    Geo.segmentTouchesOrCrosses(aa, ab, ba, bb) &&
    Geo.segmentTouchesOrCrosses(ba, bb, aa, ab)
  }

  public static pointsAtPos (points: Point2[], pos: Point2): Point2[] {
    var i
    var atPos = []
    for (i = 0; i < points.length; i++) {
      atPos[i] = new Point2(points[i].x + pos.x, points[i].y + pos.y)
    }
    return atPos
  }

  public intersectsWith (ogeo: Geo): boolean {
    let collision = false
    let points
    let point
    let polyPos

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
      for (let i = 0, prev = points.length - 1; i < points.length; prev = i++) {
        if (((polyPos.y + points[i].y > point.y) !== (polyPos.y + points[prev].y > point.y)) &&
          (point.x < (points[prev].x - points[i].x) * (point.y - (polyPos.y + points[i].y)) / (points[prev].y - points[i].y) + polyPos.x + points[i].x)) {
          collision = !collision
        }
      }
    } else {
      points = Geo.pointsAtPos(this.points, this.pos)
      const opoints = Geo.pointsAtPos(ogeo.points, ogeo.pos)
      for (let i = 0, prev = points.length - 1; i < points.length; prev = i++) {
        for (let oi = 0, oprev = opoints.length - 1; oi < opoints.length; oprev = oi++) {
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
