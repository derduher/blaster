'use strict';
/*jshint bitwise: false*/
export default function Roid (cw) {
  this.width = (9 + 100 * Math.random()) | 0;
  this.health = this.initialHealth = (0.5 + Math.random()) * this.width * this.width | 0;
  this.x = cw * Math.random();
  this.y = 0 - this.width;
  this.vx = 0.2 * (-0.5 + Math.random());
  this.vy = 1 * Math.random();
  this.color = 'black';
  this.path = new Path2D();
  this.path.arc(this.width / 2, this.width / 2, this.width / 2, 0, Math.PI * 2);
}

Roid.prototype.tick = function tick () {};

Roid.prototype.draw = function draw (ctx) {
  ctx.save();
  ctx.fillStyle = 'rgb(' + (148 + 107 * (1 - this.health / this.initialHealth) | 0) + ',0,234)';
  //ctx.fillStyle = this.color;
  ctx.translate(this.x, this.y);
  ctx.fill(this.path);
  ctx.restore();
};
