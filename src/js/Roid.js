'use strict'
/* jshint bitwise: false*/
import Geo from './Geo.js'
import Point2 from './Point2.js'

function getX (ang, mag) {
  return mag * Math.cos(ang)
}

function getY (ang, mag) {
  return mag * Math.sin(ang)
}

function getMag (max) {
  var extra = 0
  if (Math.random() > 0.8) {
    extra = (-0.8 + Math.random()) * max * 0.25
  }
  return 0.8125 * max + 3 * (-0.5 + Math.random()) + extra
}

export default function Roid (cw) {
  this.color = 'black'
  this.geo = new Geo()

  this.path = new Path2D()
  var s = 3
  var mrad = 4 + 28 * Math.random() // max radius
  var numPoints = 12

  // starting point
  var m = getMag(mrad) // magnitude
  var startX = s * (m + mrad)
  var startY = s * mrad

  this.geo.aabb.min = {
    x: Number.POSITIVE_INFINITY,
    y: Number.POSITIVE_INFINITY
  }

  this.geo.aabb.max = {
    x: s * (m + mrad),
    y: Number.NEGATIVE_INFINITY
  }
  this.geo.points.push(new Point2(startX, startY))
  var i = 1
  var a = 0
  var inc = 2 * Math.PI / numPoints
  var x, y

  this.path.moveTo(startX, startY)

  while (i < numPoints) {
    a = inc * i
    m = getMag(mrad)
    x = getX(a, m)
    y = getY(a, m)
    y = mrad - y
    x += mrad
    x *= s
    y *= s
    this.geo.points.push(new Point2(x, y))
    if (x > this.geo.aabb.max.x) {
      this.geo.aabb.max.x = x
    } else if (x < this.geo.aabb.min.x) {
      this.geo.aabb.min.x = x
    }
    // reverse order of x because its technically possible for
    // a completely ascending order of maxes
    if (y < this.geo.aabb.min.y) {
      this.geo.aabb.min.y = y
    } else if (y > this.geo.aabb.max.y) {
      this.geo.aabb.max.y = y
    }

    this.path.lineTo(x, y)
    i++
  }
  this.path.lineTo(startX, startY)
  this.width = this.geo.aabb.max.x - this.geo.aabb.min.x
  this.health = this.initialHealth = (0.5 + Math.random()) * this.width * this.width | 0
  this.geo.pos.x = cw * Math.random()
  this.geo.pos.y = 0 - this.geo.aabb.max.y
  this.geo.v.x = 0.2 * (-0.5 + Math.random())
  this.geo.v.y = Math.random()
}

Roid.prototype.tick = function tick () {}

Roid.prototype.draw = function draw (ctx) {
  ctx.save()
  ctx.strokeStyle = 'rgb(' + (148 + 107 * (1 - this.health / this.initialHealth) | 0) + ',0,234)'
  // ctx.fillStyle = this.color
  ctx.translate(this.geo.pos.x, this.geo.pos.y)
  ctx.stroke(this.path)
  ctx.restore()
}
