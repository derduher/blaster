'use strict';
import Geo from './Geo.js';
export default function Projectile (craft) {
  var vy = -10 + craft.geo.v.y;
  this.geo = new Geo(craft.geo.pos.x + craft.width / 2, craft.geo.pos.y + vy,
                     craft.geo.v.x, vy,
                     -0.004, -0.004);
  this.width = 3;
  this.geo.aabb.min.x = 0;
  this.geo.aabb.min.y = 0;
  this.geo.aabb.max.x = this.width;
  this.geo.aabb.max.y = this.width;
  this.health = 150;
  this.boundToCanvas = false;
}

Projectile.prototype.tick = function tick () {
};

Projectile.prototype.draw = function draw (ctx) {
  ctx.save();
  ctx.translate(this.geo.pos.x, this.geo.pos.y);
  ctx.fillRect(0, 0, this.width, this.width);
  ctx.restore();
};
