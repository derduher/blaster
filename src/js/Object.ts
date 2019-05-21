/* eslint-disable no-return-assign */
import Geo from './Geo'
import { defaultObjMass } from './config.js'
import { BoundingBox } from './types'
import Stage from './Stage'
import Point2 from './Point2'
import Vector2 from './Vector2'

export default class Obj {
  mass: number
  geo: Geo
  path: Path2D

  boundToCanvas = false
  isHighlighted = false
  isDisplayCell = false
  highlightColor = ''
  width = 0
  immortal = false
  health = 1
  constructor (pos: Point2, public stage: Stage, points: Point2[], v?: Vector2) {
    this.mass = defaultObjMass
    this.geo = new Geo(points, pos, v)

    this.path = new Path2D()
  }

  /* istanbul ignore next */
  draw (ctx: CanvasRenderingContext2D, debug = false) : void {
    ctx.strokeStyle = 'rgb(255,255,255)'
    if (this.isHighlighted) {
      ctx.strokeStyle = this.highlightColor
    }
    ctx.translate(this.geo.pos.x, this.geo.pos.y)
    ctx.stroke(this.path)
    if (debug) {
      ctx.font = '24px roboto'
      ctx.fillText(this.health + '', 10, 35)
    }
    // if (this.isDisplayCell) {
    // ctx.font = '24px roboto'
    // ctx.fillText(window.spatial.getIdForObject(this.geo).join(', '), 10, 0)
    // }
  }

  /* istanbul ignore next */
  displayCell () : void {
    this.isDisplayCell = true
  }

  /* istanbul ignore next */
  highlight (highlightColor = 'yellow') : void {
    this.isHighlighted = true
    this.highlightColor = highlightColor
    window.setTimeout(() => this.isHighlighted = false, 5000)
  }

  /* istanbul ignore next */
  tick (now?: number) : void {
  }

  intersects (o: Obj, i: number, cullQ: number[]) : void {
    // f = ma
    // let fx = (this.geo.v.x / 16.7) * this.mass
    // let fy = (this.geo.v.y / 16.7) * this.mass
    this.health -= 10
    if (this.health <= 0 && this.immortal !== true) {
      cullQ.push(i)
    }
    this.highlight()
    o.highlight()
  }
}
