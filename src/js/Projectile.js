'use strict'
import Vector2 from './Vector2.js'
import Geo from './Geo.js'
export default function Projectile (craft, dv = (new Vector2(0, -10))) {
  var vy = dv.y + craft.geo.v.y
  var vx = dv.x + craft.geo.v.x
  this.geo = new Geo(
    craft.geo.pos.x + craft.width / 2 + vx,
    craft.geo.pos.y + vy,
    vx,
    vy,
    -0.004,
    -0.004
  )
  this.width = 3
  this.geo.aabb.min.x = 0
  this.geo.aabb.min.y = 0
  this.geo.aabb.max.x = this.width
  this.geo.aabb.max.y = this.width
  this.geo.treatAsPoint = true
  this.health = 150
  this.boundToCanvas = false
}

Projectile.prototype.tick = function tick () {}

Projectile.prototype.draw = function draw (ctx) {
  ctx.save()
  ctx.translate(this.geo.pos.x, this.geo.pos.y)
  ctx.fillRect(0, 0, this.width, this.width)
  ctx.restore()
}
