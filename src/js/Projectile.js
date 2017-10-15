// import Vector2 from './Vector2.js'
import Obj from './Object.js'
// import Point2 from './Point2.js'

export default class Projectile extends Obj {
  constructor (geo, stage, width = 6) {
    super(geo.pos, stage)
    this.geo = geo
    this.mass = 0.1 // Gg
    this.width = width
    this.geo.aabb.max.x = this.width
    this.geo.aabb.max.y = this.width
    this.geo.treatAsPoint = true
    this.health = 10
    this.boundToCanvas = false
  }

  draw (ctx, debug = false) {
    ctx.translate(this.geo.pos.x, this.geo.pos.y)
    ctx.fillStyle = 'rgb(255,255,255)'
    if (this.isHighlighted) {
      ctx.fillStyle = this.highlightColor
    }
    ctx.beginPath()
    ctx.arc(this.width / 2, this.width / 2, this.width / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    // if (debug) {
      // ctx.font = '18px roboto'
      // ctx.fillText(`${this.geo.pos.x},${this.geo.pos.y}`, 100, 10)
    // }
    // if (this.isDisplayCell) {
    // ctx.font = '24px roboto'
    // ctx.fillText(window.spatial.getIdForObject(this.geo).join(', '), 10, 0)
    // }
  }

  displayCell () {
    this.isDisplayCell = true
  }
}
