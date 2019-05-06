import Point2 from './Point2'
import Obj from './Object'
import Projectile from './Projectile'
import Geo from './Geo'
import Stage from './Stage'
import Controls from './Controls'
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
  geo,
  thruster
} = craft

var posDir = speed
var negDir = speed * -1

export default class Craft extends Obj {
  lastFire: number
  boundToCanvas: boolean
  currentWeapon: number
  weaponConfigurations: number[]
  ctrl: Controls
  path: Path2D
  originalPath: Path2D
  constructor (stage: Stage, ctrl: Controls) {
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
    this.weaponConfigurations = [
      Math.random() * 20 | 0,
      Math.random() * 20 | 0,
      Math.random() * 20 | 0,
      Math.random() * 20 | 0
    ]
    this.currentWeapon = 0

    geo.forEach(segment => segment.forEach(point => this.geo.points.push(point)))

    let segments = [...geo]
    segments.forEach(segment => {
      const points = [...segment]
      const first = points.shift()
      if (first) {
        this.path.moveTo(first.x, first.y)
        points.forEach(pt => {
          this.path.lineTo(pt.x, pt.y)
        })
      }
    })

    this.path.closePath()
    this.originalPath = this.path

    this.geo.aabb.max.x = width
    this.geo.aabb.max.y = height

    this.ctrl = ctrl
  }

  tick (now: number): void {
    var lastFireDelta = now - this.lastFire

    // set ctrl dir
    if (this.ctrl.l && !this.ctrl.r) {
      this.geo.acc.x = negDir
    } else if (this.ctrl.r && !this.ctrl.l) {
      this.geo.acc.x = posDir
    } else if (this.ctrl.autoBreak && (
      this.geo.v.x > speed ||
      this.geo.v.x < -speed
    )) {
      if (this.geo.v.x > speed) {
        this.geo.acc.x = negDir
      } else if (this.geo.v.x < -speed) {
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
      this.geo.v.y > speed ||
      this.geo.v.y < -speed
    )) {
      if (this.geo.v.y > speed) {
        this.geo.acc.y = negDir
      } else if (this.geo.v.y < -speed) {
        this.geo.acc.y = posDir
      }
    } else {
      this.geo.acc.y = 0
    }

    if (this.ctrl.touch) {
      this.geo.pos.x = this.ctrl.touchX
      this.geo.pos.y = this.ctrl.touchY
    }

    if (this.ctrl.f && lastFireDelta > rateOfFire) {
      this.fire(now)
    }

    if (this.ctrl.weaponNext) {
      this.nextConfiguration()
    }

    if (this.ctrl.weaponPrev) {
      this.nextConfiguration()
    }

    this.path = new Path2D(this.originalPath)
    let thrusterPath = new Path2D()
    if (this.geo.acc.x > 0) {
      thrusterPath.moveTo(thruster.left[0].x, thruster.left[0].y)
      thrusterPath.lineTo(thruster.left[1].x, thruster.left[1].y)
      thrusterPath.lineTo(thruster.left[2].x, thruster.left[2].y)
      thrusterPath.lineTo(thruster.left[3].x, thruster.left[3].y)
      thrusterPath.closePath()
      this.path.addPath(thrusterPath)
    } else if (this.geo.acc.x < 0) {
      thrusterPath.moveTo(thruster.right[0].x, thruster.right[0].y)
      thrusterPath.lineTo(thruster.right[1].x, thruster.right[1].y)
      thrusterPath.lineTo(thruster.right[2].x, thruster.right[2].y)
      thrusterPath.lineTo(thruster.right[3].x, thruster.right[3].y)
      thrusterPath.closePath()
      this.path.addPath(thrusterPath)
    }

    if (this.geo.acc.y > 0) {
      thrusterPath.moveTo(thruster.up[0].x, thruster.up[0].y)
      thrusterPath.lineTo(thruster.up[1].x, thruster.up[1].y)
      thrusterPath.lineTo(thruster.up[2].x, thruster.up[2].y)
      thrusterPath.lineTo(thruster.up[3].x, thruster.up[3].y)
      thrusterPath.closePath()
      this.path.addPath(thrusterPath)
    } else if (this.geo.acc.y < 0) {
      thrusterPath.moveTo(thruster.down[0].x, thruster.down[0].y)
      thrusterPath.lineTo(thruster.down[1].x, thruster.down[1].y)
      thrusterPath.lineTo(thruster.down[2].x, thruster.down[2].y)
      thrusterPath.lineTo(thruster.down[3].x, thruster.down[3].y)
      thrusterPath.closePath()
      this.path.addPath(thrusterPath)
    }
  }

  nextConfiguration () {
    this.currentWeapon = (this.currentWeapon + 1) % this.weaponConfigurations.length
  }

  prevConfiguration () {
    this.currentWeapon = Math.abs(this.currentWeapon - 1 % this.weaponConfigurations.length)
  }

  fire (now : number) {
    const size = this.weaponConfigurations[this.currentWeapon]
    const pos = new Point2(
      this.geo.pos.x + this.width / 2 + this.geo.v.x + 10 - size / 2,
      this.geo.pos.y - size + 5
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
