'use strict'
import Vector2 from './Vector2.js'
import Point2 from './Point2.js'

export default class Geo {
  constructor (x = 0, y = 0, dx = 0, dy = 0, ax = 0, ay = 0) {
    this.pos = new Point2(x, y)
    this.v = new Vector2(dx, dy)
    this.acc = new Vector2(ax, ay)
    this.points = []
    this.aabb = {min: new Point2(), max: new Point2()}
    this.treatAsPoint = false
  }
  // This can probably be simplified.
  aabbIntersects (b) {
    let aminx = this.pos.x + this.aabb.min.x
    let bminx = b.pos.x + b.aabb.min.x
    let aminy = this.pos.y + this.aabb.min.y
    let bminy = b.pos.y + b.aabb.min.y
    // foo
    return ((aminx < bminx && this.pos.x + this.aabb.max.x > bminx) ||
    (bminx < aminx && b.pos.x + b.aabb.max.x > aminx)) &&
    ((aminy < bminy && this.pos.y + this.aabb.max.y > bminy) ||
    (bminy < aminy && b.pos.y + b.aabb.max.y > aminy))
  // return this.x > b.x && this.x < b.x + b.width && this.y > b.y && this.y < b.y + b.width
  }
  // http://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
  crossProduct (a, b) {
    return a.x * b.y - b.x * a.y
  }
  isPointOnLine (aa, ab, b) {
    var aTmp = new Point2(ab.x - aa.x, ab.y - aa.y)
    var bTmp = new Point2(b.x - aa.x, b.y - aa.y)
    return Math.abs(this.crossProduct(aTmp, bTmp)) < Number.EPSILON
  }
  isPointRightOfLine (aa, ab, b) {
    // Move the image, so that a.first is on (0|0)
    var aTmp = new Point2(ab.x - aa.x, ab.y - aa.y)
    var bTmp = new Point2(b.x - aa.x, b.y - aa.y)
    return this.crossProduct(aTmp, bTmp) < 0
  }
  segmentTouchesOrCrosses (aa, ab, ba, bb) {
    return this.isPointOnLine(aa, ab, ba) ||
    this.isPointOnLine(aa, ab, bb) || (
    this.isPointRightOfLine(aa, ab, ba) ^
    this.isPointRightOfLine(aa, ab, bb)
    )
  }
  getSegmentBB (a, b) {
    return [new Point2(Math.min(a.x, b.x), Math.min(a.y, b.y)), new Point2(Math.max(a.x, b.x), Math.max(a.y, b.y))]
  }
  segmentsBBIntersect (aa, ab, ba, bb) {
    var firstbb = this.getSegmentBB(aa, ab)
    var secondbb = this.getSegmentBB(ba, bb)
    return firstbb[0].x <= secondbb[1].x &&
    firstbb[1].x >= secondbb[0].x &&
    firstbb[0].y <= secondbb[1].y &&
    firstbb[1].y >= secondbb[0].y
  }
  segmentsIntersect (aa, ab, ba, bb) {
    return this.segmentsBBIntersect(aa, ab, ba, bb) &&
    this.segmentTouchesOrCrosses(aa, ab, ba, bb) &&
    this.segmentTouchesOrCrosses(ba, bb, aa, ab)
  }
  pointsAtPos (points, pos) {
    var i
    var atPos = []
    for (i = 0; i < points.length; i++) {
      atPos[i] = new Point2(points[i].x + pos.x, points[i].y + pos.y)
    }
    return atPos
  }
  intersectsWith (ogeo) {
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
      points = this.pointsAtPos(this.points, this.pos)
      opoints = ogeo.pointsAtPos(ogeo.points, ogeo.pos)
      for (i = 0, prev = points.length - 1; i < points.length; prev = i++) {
        for (oi = 0, oprev = opoints.length - 1; oi < opoints.length; oprev = oi++) {
          if (this.segmentsIntersect(points[i], points[prev], opoints[oi], opoints[oprev])) {
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

// line segments
