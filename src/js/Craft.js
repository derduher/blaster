'use strict'
/* jshint bitwise: false*/
var pSpeed = 50

const speed = 5
var posDir = speed
var negDir = speed * -1
import Geo from './Geo.js'
import Point2 from './Point2.js'

import Projectile from './Projectile.js'
export default function Craft (stage, ctrl) {
  this.geo = new Geo()
  this.stage = stage
  this.lastFire = 0
  this.boundToCanvas = true
  this.width = 50
  this.path = new Path2D()
  this.health = Number.POSITIVE_INFINITY

  this.path.moveTo(0, this.width)
  this.geo.points.push(new Point2(0, this.width))
  this.path.lineTo(this.width, this.width)
  this.geo.points.push(new Point2(this.width, this.width))
  this.path.lineTo(this.width / 2, 0)
  this.geo.points.push(new Point2(this.width / 2, 0))

  this.path.closePath()

  this.geo.aabb.min.x = 0
  this.geo.aabb.min.y = 0
  this.geo.aabb.max.x = this.width
  this.geo.aabb.max.y = this.width

  this.geo.pos.x = document.documentElement.clientWidth / 2 - this.width / 2
  this.geo.pos.y = document.documentElement.clientHeight - this.width - stage.padding
  this.ctrl = ctrl
}

Craft.prototype.draw = function draw (ctx) {
  ctx.save()
  ctx.translate(this.geo.pos.x, this.geo.pos.y)
  ctx.stroke(this.path)
  ctx.restore()
}

Craft.prototype.tick = function tick (now) {
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
