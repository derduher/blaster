// import Vector2 from './Vector2.js'
import Obj from './Object'
// import Point2 from './Point2.js'
import {
  projectile
} from './config.js'
import Geo from './Geo'
import Stage from './Stage'
import Point2 from './Point2'
import Vector2 from './Vector2'
const {
  mass,
  width: defaultWidth,
  health
} = projectile

export default class Projectile extends Obj {
  boundToCanvas: boolean
  // why is this being handed a pre crafted geometry?
  constructor (pos: Point2, v: Vector2, stage: Stage, width = defaultWidth) {
    super(pos, stage, [new Point2()], v)
    this.mass = mass // Gg
    this.width = width
    this.geo.aabb.max.x = this.width
    this.geo.aabb.max.y = this.width
    this.geo.treatAsPoint = true
    this.health = health
    this.boundToCanvas = false
  }
  /* istanbul ignore next */
  draw (ctx: CanvasRenderingContext2D, debug = false) {
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

  /* istanbul ignore next */
  displayCell () {
    this.isDisplayCell = true
  }

  intersects (o: Obj, i: number, cullQ:number[]) {
    o.health -= 10
    super.intersects(o, i, cullQ)
  }
}
