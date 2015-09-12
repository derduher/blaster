'use strict';
/*jshint bitwise: false*/

function getX (ang, mag) {
  return mag * Math.cos(ang);
}

function getY (ang, mag) {
  return mag * Math.sin(ang);
}

function getMag (max) {
  var extra = 0;
  if (Math.random() > 0.8) {
    extra = (-0.8 + Math.random()) * max * 0.25;
  }
  return 0.8125 * max + 3 * (-0.5 + Math.random()) + extra;
}

export default function Roid (cw) {
  this.color = 'black';


  this.path = new Path2D();
  var s = 3;
  var mrad = 4 + 28 * Math.random(); //max radius
  var numPoints = 12;

  // starting point
  var m = getMag(mrad); //magnitude
  var startX = s * (m + mrad),
      startY = s * mrad;
  this.min = {
    x: Number.POSITIVE_INFINITY,
    y: Number.POSITIVE_INFINITY
  };
  this.max = {
    x: s * (m + mrad),
    y: Number.NEGATIVE_INFINITY
  };
  this.points = [startX, startY];
  var i = 1;
  var a = 0;
  var inc = 2 * Math.PI / numPoints;
  var x, y;


  this.path.moveTo(startX, startY);

  while (i < numPoints) {
    a = inc * i;
    m = getMag(mrad);
    x = getX(a, m);
    y = getY(a, m);
    y = mrad - y;
    x += mrad;
    x *= s;
    y *= s;
    this.points.push(x, y);
    if (x > this.max.x) {
      this.max.x = x;
    } else if (x < this.min.x) {
      this.min.x = x;
    }
    //reverse order of x because its technically possible for 
    // a completely ascending order of maxes 
    if (y < this.min.y) {
      this.min.y = y;
    } else if (y > this.max.y) {
      this.max.y = y;

    }
    this.path.lineTo(x, y);
    i++;
  }
  this.path.lineTo(startX, startY);
  this.width = this.max.x - this.min.x;
  this.health = this.initialHealth = (0.5 + Math.random()) * this.width * this.width | 0;
  this.x = cw * Math.random();
  this.y = 0 - this.max.y;
  this.vx = 0.2 * (-0.5 + Math.random());
  this.vy = 1 * Math.random();
}


  //line segments
  //for (i=0; i < points.length; i+=2) {
    //var bx;
    //if (i === points.length - 2) {
      //bx = points[0];
      //by = points[1];
    //} else {
      //bx = points[i+2];
      //by = points[i+3];
    //}
    //console.log(points[i].toFixed(0), points[i+1].toFixed(0), bx.toFixed(0), by.toFixed(0))
  //}

Roid.prototype.tick = function tick () {};

Roid.prototype.draw = function draw (ctx) {
  ctx.save();
  ctx.strokeStyle = 'rgb(' + (148 + 107 * (1 - this.health / this.initialHealth) | 0) + ',0,234)';
  //ctx.fillStyle = this.color;
  ctx.translate(this.x, this.y);
  ctx.stroke(this.path);
  ctx.restore();
};
