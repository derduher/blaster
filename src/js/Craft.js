/* jshint bitwise: false */
import Point2 from './Point2.js'
import Obj from './Object.js'
import Projectile from './Projectile.js'
import Geo from './Geo.js'

var pSpeed = 50

const speed = 0.1 // m/s
var posDir = speed
var negDir = speed * -1
export default class Craft extends Obj {
  constructor (stage, ctrl) {
    const width = 50
    const pos = new Point2(document.documentElement.clientWidth / 2 - width / 2, document.documentElement.clientHeight - width - stage.padding)
    super(pos, stage)
    this.mass = 8 // Gg
    this.lastFire = 0
    this.boundToCanvas = true
    this.width = width
    this.health = 1000
    this.immortal = true
    this.projectileSize = Math.random() * 20 | 0

    this.path.moveTo(0, this.width)
    this.geo.points.push(new Point2(0, this.width))
    this.path.lineTo(this.width, this.width)
    this.geo.points.push(new Point2(this.width, this.width))
    this.path.lineTo(this.width / 2, 0)
    this.geo.points.push(new Point2(this.width / 2, 0))

    this.path.closePath()

    this.geo.aabb.max.x = this.width
    this.geo.aabb.max.y = this.width

    this.ctrl = ctrl
  }

  tick (now) {
    var pdt = now - this.lastFire

    // set ctrl dir
    if (this.ctrl.l && !this.ctrl.r) {
      this.geo.acc.x = negDir
    } else if (this.ctrl.r && !this.ctrl.l) {
      this.geo.acc.x = posDir
    } else {
      this.geo.acc.x = 0
    }

    // set ctrl dir
    if (this.ctrl.d && !this.ctrl.u) {
      this.geo.acc.y = posDir
    } else if (this.ctrl.u && !this.ctrl.d) {
      this.geo.acc.y = negDir
    } else {
      this.geo.acc.y = 0
    }
    if (this.ctrl.touch) {
      this.geo.pos.x = this.ctrl.touchX
      this.geo.pos.y = this.ctrl.touchY
    }

    if (this.ctrl.f && pdt > pSpeed) {
      const pos = new Point2(
        this.geo.pos.x + this.width / 2 + this.geo.v.x - this.projectileSize / 2,
        this.geo.pos.y - this.projectileSize - 5
      )
      let p = new Projectile(
        new Geo(
          pos.x,
          pos.y,
          0,
          -5
        ),
        this.stage,
        this.projectileSize
      )

      this.stage.items.push(p)
      this.stage.spatialManager.registerObject(p)
      this.lastFire = now
    }
  }
}
