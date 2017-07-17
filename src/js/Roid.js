/* jshint bitwise: false*/
import Point2 from './Point2.js'
import Obj from './Object.js'

function getX (ang, mag) {
  return mag * Math.cos(ang)
}

function getY (ang, mag) {
  return mag * Math.sin(ang)
}

function getMag (max) {
  var extra = 0
  if (Math.random() > 0.8) {
    extra = (-0.8 + Math.random()) * max * 0.25
  }
  return 0.8125 * max + 3 * (-0.5 + Math.random()) + extra
}

const s = 3
const numPoints = 12
export default class Roid extends Obj {
  constructor (geo, stage) {
    super(geo.pos, stage)
    this.geo.pos = geo.pos
    this.geo.v = geo.v
    // scalar
    var mrad = 4 + 28 * Math.random() // max radius

    // starting point
    var m = getMag(mrad) // magnitude
    var startX = s * (m + mrad)
    var startY = s * mrad

    this.geo.aabb.min = {
      x: Number.POSITIVE_INFINITY,
      y: Number.POSITIVE_INFINITY
    }

    this.geo.aabb.max = {
      x: s * (m + mrad),
      y: Number.NEGATIVE_INFINITY
    }
    this.geo.points.push(new Point2(startX, startY))
    var i = 1
    var a = 0
    var inc = 2 * Math.PI / numPoints
    var x, y

    this.path.moveTo(startX, startY)

    while (i < numPoints) {
      a = inc * i
      m = getMag(mrad)
      x = getX(a, m)
      y = getY(a, m)
      y = mrad - y
      x += mrad
      x *= s
      y *= s
      this.geo.points.push(new Point2(x, y))
      if (x > this.geo.aabb.max.x) {
        this.geo.aabb.max.x = x
      } else if (x < this.geo.aabb.min.x) {
        this.geo.aabb.min.x = x
      }
      // reverse order of x because its technically possible for
      // a completely ascending order of maxes
      if (y < this.geo.aabb.min.y) {
        this.geo.aabb.min.y = y
      } else if (y > this.geo.aabb.max.y) {
        this.geo.aabb.max.y = y
      }

      this.path.lineTo(x, y)
      i++
    }
    this.path.lineTo(startX, startY)
    this.width = this.geo.aabb.max.x - this.geo.aabb.min.x
    this.health = this.initialHealth = (0.5 + Math.random()) * this.width * this.width | 0
  }

  draw (ctx, debug = false) {
    ctx.save()
    ctx.strokeStyle = 'rgb(' + (148 + 107 * (1 - this.health / this.initialHealth) | 0) + ',0,234)'
    // ctx.fillStyle = this.color
    ctx.translate(this.geo.pos.x, this.geo.pos.y)

    if (debug) {
      ctx.font = '24px roboto'
      ctx.fillText(`${this.geo.pos.x},${this.geo.pos.y}`, 100, 10)
    }

    ctx.stroke(this.path)
    ctx.restore()
  }
}
