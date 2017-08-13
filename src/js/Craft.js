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
    const width = 48
    const height = 76
    const pos = new Point2(document.documentElement.clientWidth / 2 - width / 2, document.documentElement.clientHeight - width - stage.padding)
    super(pos, stage)
    this.mass = 8 // Gg
    this.lastFire = 0
    this.boundToCanvas = true
    this.width = width
    this.health = 1000
    this.immortal = true
    this.projectileSize = Math.random() * 20 | 0

    this.geo.points.push(new Point2(9, 38.45))
    this.geo.points.push(new Point2(9, 10))
    this.geo.points.push(new Point2(5, 10))
    this.geo.points.push(new Point2(5, 54.95))

    this.geo.points.push(new Point2(39, 38.45))
    this.geo.points.push(new Point2(39, 10))
    this.geo.points.push(new Point2(43, 10))
    this.geo.points.push(new Point2(43, 54.95))

    this.geo.points.push(new Point2(18, 0))
    this.geo.points.push(new Point2(30, 0))
    this.geo.points.push(new Point2(48, 76))
    this.geo.points.push(new Point2(0, 76))

    let points = [...this.geo.points]
    let first = points.shift()
    this.path.moveTo(first.x, first.y)
    for (let i = 0; i < 3; i++) {
      let pt = points.shift()
      this.path.lineTo(pt.x, pt.y)
    }

    first = points.shift()
    this.path.moveTo(first.x, first.y)
    for (let i = 0; i < 3; i++) {
      let pt = points.shift()
      this.path.lineTo(pt.x, pt.y)
    }

    first = points.shift()
    this.path.moveTo(first.x, first.y)
    for (let i = 0; points.length; i++) {
      let pt = points.shift()
      this.path.lineTo(pt.x, pt.y)
    }

    this.path.closePath()

    this.geo.aabb.max.x = width
    this.geo.aabb.max.y = height

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
