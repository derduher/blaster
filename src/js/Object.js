import Geo from './Geo.js'

export default class Obj {
  constructor (pos, stage) {
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
    ctx.save()
    if (this.isHighlighted) {
      ctx.strokeStyle = this.highlightColor
    }
    ctx.translate(this.geo.pos.x, this.geo.pos.y)
    ctx.stroke(this.path)
    if (debug) {
      ctx.font = '24px roboto'
      ctx.fillText(this.health, 10, 0)
    }
    // if (this.isDisplayCell) {
    // ctx.font = '24px roboto'
    // ctx.fillText(window.spatial.getIdForObject(this.geo).join(', '), 10, 0)
    // }
    ctx.restore()
  }

  displayCell () {
    this.isDisplayCell = true
  }

  highlight (highlightColor = 'blue') {
    this.isHighlighted = true
    this.highlightColor = highlightColor
    window.setTimeout(() => this.isHighlighted = false, 5000)
  }

  tick () {
  }

  intersects (o, i, cullQ) {
    this.health -= 10
    if (this.health < 9) {
      cullQ.push(i)
    }
    this.highlight()
    o.highlight()
  }
}
