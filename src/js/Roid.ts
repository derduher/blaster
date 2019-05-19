/* jshint bitwise: false */
import Point2 from './Point2'
import Obj from './Object'
import { roid } from './config.js'
import { GenPos } from './roidPosFactory'
import Stage from './Stage'

const {
  numPoints,
  mass,
  maxRadius,
  minRadius
} = roid

function getX (ang: number, mag: number) {
  return mag * Math.cos(ang)
}

function getY (ang: number, mag: number) {
  return mag * Math.sin(ang)
}

function getMag (max: number) {
  let extra = 0
  if (Math.random() > 0.8) {
    extra = (-0.8 + Math.random()) * max * 0.25
  }
  return 0.8125 * max + 3 * (-0.5 + Math.random()) + extra
}

const s = 3
export default class Roid extends Obj {
  initialHealth: number
  constructor (geo: GenPos, stage: Stage) {
    super(geo.pos, stage)
    this.geo.pos = geo.pos
    this.geo.v = geo.v
    // https://en.wikipedia.org/wiki/101955_Bennu
    this.mass = mass * Math.random() // Gg
    // scalar
    const mrad = minRadius + maxRadius * Math.random() // max radius

    // starting point
    let m = getMag(mrad) // magnitude
    const startX = s * (m + mrad)
    const startY = s * mrad

    this.geo.aabb.min = {
      x: Number.POSITIVE_INFINITY,
      y: Number.POSITIVE_INFINITY
    }

    this.geo.aabb.max = {
      x: s * (m + mrad),
      y: Number.NEGATIVE_INFINITY
    }
    this.geo.points.push(new Point2(startX, startY))
    let i = 1
    let a = 0
    const inc = 2 * Math.PI / numPoints
    let x
    let y

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
}
