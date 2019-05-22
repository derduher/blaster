import Point2 from './Point2'
import Obj from './Object'
import Projectile from './Projectile'
import Geo from './Geo'
import Stage from './Stage'
import Controls from './Controls'
import Vector2 from './Vector2'
import { pathFromPoints, pathFromSegments } from './draw'
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

const leftThrusterPath = pathFromPoints(thruster.left)
const rightThrusterPath = pathFromPoints(thruster.right)
const upThrusterPath = pathFromPoints(thruster.up)
const downThrusterPath = pathFromPoints(thruster.down)

const posDir = speed
const negDir = speed * -1

export default class Craft extends Obj {
  weaponConfigurations: number[]
  ctrl: Controls
  originalPath: Path2D
  lastFire = 0
  boundToCanvas = true
  immortal = immortal
  health = health
  width = width
  mass = mass // Gg
  currentWeapon = 0
  constructor (stage: Stage, ctrl: Controls, pos: Point2) {
    super(pos, stage, geo.flat())
    this.weaponConfigurations = [
      Math.random() * 20 | 0,
      Math.random() * 20 | 0,
      Math.random() * 20 | 0,
      Math.random() * 20 | 0
    ]

    this.originalPath = this.path = pathFromSegments(geo)

    this.ctrl = ctrl
  }

  tick (now: number): void {
    const lastFireDelta = now - this.lastFire

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

    if (this.geo.acc.x !== 0 || this.geo.acc.y !== 0) {
      this.path = new Path2D(this.originalPath)
      if (this.geo.acc.x > 0) {
        this.path.addPath(leftThrusterPath)
      } else if (this.geo.acc.x < 0) {
        this.path.addPath(rightThrusterPath)
      }

      if (this.geo.acc.y > 0) {
        this.path.addPath(upThrusterPath)
      } else if (this.geo.acc.y < 0) {
        this.path.addPath(downThrusterPath)
      }
    } else {
      this.path = this.originalPath
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
      pos,
      new Vector2(0, -velY),
      this.stage,
      size
    )

    this.stage.items.push(p)
    this.stage.spatialManager.registerObject(p)
    this.lastFire = now
  }
}
