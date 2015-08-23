'use strict';
export default function Projectile (craft) {
  this.x = craft.x + craft.width / 2;
  this.width = 3;
  this.health = 150;
  this.vx = craft.vx;
  this.vy = -10 + craft.vy;
  this.y = craft.y + this.vy;
  this.boundToCanvas = false;
}

Projectile.prototype.tick = function tick () {
  this.vx *= 0.996;
  this.vy *= 0.996;
};

Projectile.prototype.draw = function draw (ctx) {
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.fillRect(0, 0, this.width, this.width);
  ctx.restore();
};
