/* eslint-disable no-return-assign */
import Geo from './Geo.js'
import { defaultObjMass } from './config.js'

export default class Obj {
  constructor (pos, stage) {
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

  draw (ctx, debug = false) {
    ctx.strokeStyle = 'rgb(255,255,255)'
    if (this.isHighlighted) {
      ctx.strokeStyle = this.highlightColor
    }
    ctx.translate(this.geo.pos.x, this.geo.pos.y)
    ctx.stroke(this.path)
    if (debug) {
      ctx.font = '24px roboto'
      ctx.fillText(this.health, 10, 35)
    }
    // if (this.isDisplayCell) {
    // ctx.font = '24px roboto'
    // ctx.fillText(window.spatial.getIdForObject(this.geo).join(', '), 10, 0)
    // }
  }

  displayCell () {
    this.isDisplayCell = true
  }

  highlight (highlightColor = 'yellow') {
    this.isHighlighted = true
    this.highlightColor = highlightColor
    window.setTimeout(() => this.isHighlighted = false, 5000)
  }

  tick () {
  }

  intersects (o, i, cullQ) {
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
