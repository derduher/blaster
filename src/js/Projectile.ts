// import Vector2 from './Vector2.js'
import Obj from './Object'
// import Point2 from './Point2.js'
import {
  projectile
} from './config.js'
import Stage from './Stage'
import Point2 from './Point2'
import Vector2 from './Vector2'
const {
  mass,
  width: defaultWidth,
  health
} = projectile

export default class Projectile extends Obj {
  public boundToCanvas = false
  private diameter: number
  public mass = mass // Gg
  public health = health
  // why is this being handed a pre crafted geometry?
  public constructor (pos: Point2, v: Vector2, stage: Stage, diameter = defaultWidth) {
    super(pos, stage, [new Point2()], v)
    this.diameter = diameter
    this.geo.aabb.max.x = this.diameter
    this.geo.aabb.max.y = this.diameter
    this.geo.treatAsPoint = true
  }
  /* istanbul ignore next */
  public draw (ctx: CanvasRenderingContext2D/*, debug = false */): void {
    ctx.translate(this.geo.pos.x, this.geo.pos.y)
    ctx.fillStyle = 'rgb(255,255,255)'
    if (this.isHighlighted) {
      ctx.fillStyle = this.highlightColor
    }
    ctx.beginPath()
    ctx.arc(this.diameter / 2, this.diameter / 2, this.diameter / 2, 0, 2 * Math.PI)
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
  public displayCell (): void {
    this.isDisplayCell = true
  }

  public intersects (o: Obj, i: number, cullQ: number[]): void {
    o.health -= 10
    super.intersects(o, i, cullQ)
  }
}
