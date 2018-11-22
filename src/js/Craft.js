import Point2 from './Point2.js'
import Obj from './Object.js'
import Projectile from './Projectile.js'
import Geo from './Geo.js'
import {
  craft
} from './config'
const {
  rateOfFire,
  speed,
  force,
  barrelLength,
  width,
  height,
  mass,
  health,
  immortal,
  geo
} = craft

var posDir = speed
var negDir = speed * -1

export default class Craft extends Obj {
  constructor (stage, ctrl) {
    const pos = new Point2(
      document.documentElement.clientWidth / 2 - width / 2,
      document.documentElement.clientHeight - width - stage.padding
    )
    super(pos, stage)
    this.mass = mass // Gg
    this.lastFire = 0
    this.boundToCanvas = true
    this.width = width
    this.health = health
    this.immortal = immortal
    this.configurations = [Math.random() * 20 | 0, Math.random() * 20 | 0, Math.random() * 20 | 0, Math.random() * 20 | 0]
    this.currentConfiguration = 0

    geo.forEach(point => this.geo.points.push(point))

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
    } else if (this.ctrl.autoBreak && (
      this.geo.v.x > 0.05 ||
      this.geo.v.x < -0.05
    )) {
      if (this.geo.v.x > Number.EPSILON) {
        this.geo.acc.x = negDir
      } else if (this.geo.v.x < -Number.EPSILON) {
        this.geo.acc.x = posDir
      }
    } else {
      this.geo.acc.x = 0
    }

    // set ctrl dir
    if (this.ctrl.d && !this.ctrl.u) {
      this.geo.acc.y = posDir
    } else if (this.ctrl.u && !this.ctrl.d) {
      this.geo.acc.y = negDir
    } else if (this.ctrl.autoBreak && (
      this.geo.v.y > Number.EPSILON ||
      this.geo.v.y < -Number.EPSILON
    )) {
      if (this.geo.v.y > Number.EPSILON) {
        this.geo.acc.y = negDir
      } else if (this.geo.v.y < -Number.EPSILON) {
        this.geo.acc.y = posDir
      }
    } else {
      this.geo.acc.y = 0
    }
    if (this.ctrl.touch) {
      this.geo.pos.x = this.ctrl.touchX
      this.geo.pos.y = this.ctrl.touchY
    }

    if (this.ctrl.f && pdt > rateOfFire) {
      this.fire(now)
    }

    if (this.ctrl.weaponNext) {
      this.nextConfiguration()
    }

    if (this.ctrl.weaponPrev) {
      this.nextConfiguration()
    }
  }

  nextConfiguration () {
    this.currentConfiguration = (this.currentConfiguration + 1) % this.configurations.length
  }

  prevConfiguration () {
    this.currentConfiguration = Math.abs(this.currentConfiguration - 1 % this.configurations.length)
  }

  fire (now) {
    const size = this.configurations[this.currentConfiguration]
    const pos = new Point2(
      this.geo.pos.x + this.width / 2 + this.geo.v.x - size / 2,
      this.geo.pos.y - size - 5
    )

    const velY = Math.sqrt(2 * barrelLength * force / size)
    const p = new Projectile(
      new Geo(
        pos.x,
        pos.y,
        0,
        -velY
      ),
      this.stage,
      size
    )

    this.stage.items.push(p)
    this.stage.spatialManager.registerObject(p)
    this.lastFire = now
  }
}
