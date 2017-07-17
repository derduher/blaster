import Point2 from './Point2.js'
import Vector2 from './Vector2.js'
import Projectile from './Projectile.js'
import Obj from './Object.js'
const pSpeed = 100

export default class NPC extends Obj {
  constructor (pos, stage) {
    super(pos, stage)
    this.lastFire = window.performance.now() - pSpeed
    this.width = 10
    this.geo.aabb.max = {
      x: this.width,
      y: this.width
    }

    this.path.moveTo(0, 0)
    this.geo.points.push(new Point2(0, 0))

    this.path.lineTo(this.width, 0)
    this.geo.points.push(new Point2(this.width, 0))

    this.path.lineTo(this.width / 2, this.width)
    this.geo.points.push(new Point2(this.width / 2, this.width))

    this.path.closePath()
    this.health = 100
  }

  ai () {
    let found = false

    if (Math.abs(this.geo.pos.x - this.stage.craft.geo.pos.x) < this.stage.craft.width) {
      this.firing = true
      found = true
    }

    if (!found) {
      this.firing = false
    }
  }

  tick (now) {
    var pdt = now - this.lastFire

    this.ai()

    if (this.firing && pdt > pSpeed) {
      let p = new Projectile(this, new Vector2(0, 4))
      this.stage.items.push(p)
      this.stage.spatialManager.registerObject(p)
      this.lastFire = now
    }
  }
}
