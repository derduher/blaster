'use strict';
/*jshint bitwise: false*/
var pSpeed = 50;

const speed = 5;
var posDir = speed;
var negDir = speed * -1;

import Projectile from './Projectile.js';
export default function Craft (stage, ctrl) {
  this.stage = stage;
  this.lastFire = 0;
  this.boundToCanvas = true;
  this.vx = 0;
  this.vy = 0;
  this.width = 50;
  this.path = new Path2D();
  this.health = 1000;

  this.path.moveTo(0, this.width);
  this.path.lineTo(this.width, this.width);
  this.path.lineTo(this.width / 2, 0);
  this.path.closePath();

  this.x = stage.canvas.width / 2 - this.width / 2;
  this.y = stage.canvas.height - this.width - stage.padding;
  this.ctrl = ctrl;
}

Craft.prototype.draw = function draw (ctx) {
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.stroke(this.path);
  ctx.restore();
};

Craft.prototype.tick = function tick (now) {
  var pdt = now - this.lastFire;

  // set ctrl dir
  if (this.ctrl.l && !this.ctrl.r) {
    this.vx = negDir;
  } else if (this.ctrl.r && !this.ctrl.l) {
    this.vx = posDir;
  } else {
    this.vx = 0;
  }

  // set ctrl dir
  if (this.ctrl.d && !this.ctrl.u) {
    this.vy = posDir;
  } else if (this.ctrl.u && !this.ctrl.d) {
    this.vy = negDir;
  } else {
    this.vy = 0;
  }
  if (this.ctrl.touch) {
    this.x = this.ctrl.touchX;
    this.y = this.ctrl.touchY;
  }

  if (this.ctrl.f && pdt > pSpeed) {
    let p = new Projectile(this);
    this.stage.items.push(p);
    this.stage.spatialManager.registerObject(p);
    this.lastFire = now;
  }
};
