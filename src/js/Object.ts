/* eslint-disable no-return-assign */
import Geo from './Geo'
import { defaultObjMass } from './config.js'
import { BoundingBox } from './types'
import Stage from './Stage'
import Point2 from './Point2'

export default class Obj {
  mass: number
  immortal: boolean
  geo: Geo
  path: Path2D
  width: number
  health: number
  isHighlighted: boolean
  isDisplayCell: boolean
  highlightColor: string
  stage: Stage
  boundToCanvas: boolean

  constructor (pos: Point2, stage: Stage) {
    this.mass = defaultObjMass
    this.immortal = false
    this.stage = stage
    this.geo = new Geo()

    this.path = new Path2D()

    this.width = 0
    this.geo.aabb.min = {
      x: 0,
      y: 0
    }

    this.geo.aabb.max = {
      x: this.width,
      y: this.width
    }

    this.health = 1
    this.geo.pos = pos
  }

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

  displayCell () : void {
    this.isDisplayCell = true
  }

  highlight (highlightColor = 'yellow') : void {
    this.isHighlighted = true
    this.highlightColor = highlightColor
    window.setTimeout(() => this.isHighlighted = false, 5000)
  }

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
