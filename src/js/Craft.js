/* jshint bitwise: false */
import Point2 from './Point2.js'
import Obj from './Object.js'
import Projectile from './Projectile.js'

var pSpeed = 50

const speed = 5
var posDir = speed
var negDir = speed * -1
export default class Craft extends Obj {
  constructor (stage, ctrl) {
    const width = 50
    const pos = new Point2(document.documentElement.clientWidth / 2 - width / 2, document.documentElement.clientHeight - width - stage.padding)
    super(pos, stage)
    this.lastFire = 0
    this.boundToCanvas = true
    this.width = width
    this.health = 1000
    this.immortal = true

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
      this.geo.v.x = negDir
    } else if (this.ctrl.r && !this.ctrl.l) {
      this.geo.v.x = posDir
    } else {
      this.geo.v.x = 0
    }

    // set ctrl dir
    if (this.ctrl.d && !this.ctrl.u) {
      this.geo.v.y = posDir
    } else if (this.ctrl.u && !this.ctrl.d) {
      this.geo.v.y = negDir
    } else {
      this.geo.v.y = 0
    }
    if (this.ctrl.touch) {
      this.geo.pos.x = this.ctrl.touchX
      this.geo.pos.y = this.ctrl.touchY
    }

    if (this.ctrl.f && pdt > pSpeed) {
      let p = new Projectile(this)
      this.stage.items.push(p)
      this.stage.spatialManager.registerObject(p)
      this.lastFire = now
    }
  }
}
