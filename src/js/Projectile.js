import Vector2 from './Vector2.js'
import Geo from './Geo.js'
import Obj from './Object.js'
import Point2 from './Point2.js'

export default class Projectile extends Obj {
  constructor (craft, dv = (new Vector2(0, -5))) {
    var vy = dv.y + craft.geo.v.y
    var vx = dv.x + craft.geo.v.x
    const pos = new Point2(craft.geo.pos.x + craft.width / 2 + vx, craft.geo.pos.y + vy)
    super(pos, craft.stage)
    this.geo = new Geo(
      pos.x,
      pos.y,
      vx,
      vy,
      -0.004,
      -0.004
    )
    this.width = 6
    this.geo.aabb.max.x = this.width
    this.geo.aabb.max.y = this.width
    this.geo.treatAsPoint = true
    this.health = 5
    this.boundToCanvas = false
  }

  draw (ctx) {
    ctx.save()
    ctx.translate(this.geo.pos.x, this.geo.pos.y)
    ctx.fillStyle = 'rgb(255,255,255)'
    ctx.fillRect(0, 0, this.width, this.width)
    ctx.restore()
  }
}
