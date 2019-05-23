/* jshint bitwise: false */
import Point2 from './Point2'
import Obj from './Object'
import { roid } from './config.js'
import { GenPos } from './roidPosFactory'
import Stage from './Stage'
import { pathFromPoints } from './draw'

const {
  numPoints,
  mass,
  maxRadius,
  minRadius
} = roid

function getX (ang: number, mag: number): number {
  return mag * Math.cos(ang)
}

function getY (ang: number, mag: number): number {
  return mag * Math.sin(ang)
}

function getMag (max: number): number {
  let extra = 0
  if (Math.random() > 0.8) {
    extra = (-0.8 + Math.random()) * max * 0.25
  }
  return 0.8125 * max + 3 * (-0.5 + Math.random()) + extra
}

const s = 3
function generatePoints (): Point2[] {
  // scalar
  const mrad = minRadius + maxRadius * Math.random() // max radius

  // starting point
  let m = getMag(mrad) // magnitude
  const startX = s * (m + mrad)
  const startY = s * mrad

  const points: Point2[] = []
  points.push(new Point2(startX, startY))
  let i = 1
  let a = 0
  const inc = 2 * Math.PI / numPoints
  let x
  let y

  while (i < numPoints) {
    a = inc * i
    m = getMag(mrad)
    x = getX(a, m)
    y = getY(a, m)
    y = mrad - y
    x += mrad
    x *= s
    y *= s
    points.push(new Point2(x, y))
    i++
  }
  return points
}

export default class Roid extends Obj {
  public initialHealth: number
  public mass = mass * Math.random() // gigagrams
  public constructor (geo: GenPos, stage: Stage) {
    super(geo.pos, stage, generatePoints(), geo.v)

    this.path = pathFromPoints(this.geo.points, true)
    this.health = this.initialHealth = (0.5 + Math.random()) * (this.geo.aabb.max.x - this.geo.aabb.min.x) ** 2 | 0
  }
}
