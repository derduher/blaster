'use strict';
// Code goes here
var xmin, xmax, ymin, ymax, canvas, ctx, fpsOut, fps = 0, now,
  lastPUpdate, lastUpdate, fpsFilter = 600, fpsDrawInterval = 3000;
lastPUpdate = lastUpdate = (new Date())*1;
var pSpeed = 50;

var craft = {
  x: 0,
  y: 0,
  xDir: 0,
  yDir: 0,
  path: null,
  width: 50
};

var projectiles = [{
  x: 150,
  y: 150,
  width: 2,
  exists: false
}];

var ctrl = {
  lp: false,
  rp: false,
  up: false,
  dp: false,
  sp: false
};

const a = 65,
d = 68,
w = 87,
s = 83,
space = 32,
padding = 3;

const speed = 0.2;
var posDir = speed;
var negDir = speed * -1;

var cfg = {
  l: a,
  r: d,
  u: w,
  d: s,
  f: space
};
cfg[a] = 'l';
cfg[d] = 'r';
cfg[w] = 'u';
cfg[s] = 'd';
cfg[space] = 'f';

function kd (e) {
  ctrl[cfg[e.keyCode]] = true;
}

function ku (e) {
  ctrl[cfg[e.keyCode]] = false;
}

function draw () {
  var frameTDelta, pTdelta;
  now = new Date();
  frameTDelta = now - lastUpdate;
  pTdelta     = now - lastPUpdate;
  if (frameTDelta){
    var thisFrameFPS = 1000 / frameTDelta;
    fps += (thisFrameFPS - fps) / fpsFilter;

    lastUpdate = now;
  }

  // set ctrl dir
  if (ctrl.l && !ctrl.r) {
    craft.xDir = negDir;
  } else if (ctrl.r && !ctrl.l) {
    craft.xDir = posDir;
  } else {
    craft.xDir = 0;
  }

  // set ctrl dir
  if (ctrl.d && !ctrl.u) {
    craft.yDir = posDir;
  } else if (ctrl.u && !ctrl.d) {
    craft.yDir = negDir;
  } else {
    craft.yDir = 0;
  }

  if (ctrl.f && pTdelta > pSpeed) {
    projectiles.push({x: craft.x + craft.width/2, y: craft.y - 2});
    lastPUpdate = now;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(craft.x, craft.y);
  ctx.stroke(craft.path);
  ctx.restore();

  projectiles.forEach(function (p, idx, ps) {
    if (p.y > ymin) {
      p.y -= frameTDelta * 0.5;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillRect(0, 0, 3, 3);
      ctx.restore();
    } else {
      ps.splice(idx, 1);
    }
  });
    //console.log(projectile.x |0, projectile.y |0, craft.x |0, craft.y |0);

  // move the craft
  if ((craft.xDir !== posDir || craft.x < xmax) && (craft.xDir !== negDir || craft.x > xmin)) {
    craft.x += craft.xDir * frameTDelta;
  }
  if ((craft.yDir !== posDir || craft.y < ymax) && (craft.yDir !== negDir || craft.y > ymin)) {
    craft.y += craft.yDir * frameTDelta;
  }
  window.requestAnimationFrame(draw);
}

function drawFPS () {
  fpsOut.innerHTML = fps.toFixed(1);
  console.log(projectiles.length);
}

function init () {

  canvas = document.getElementById('tutorial');
  document.onkeyup = ku;
  document.onkeydown = kd;

  xmax = canvas.width - craft.width - padding;
  xmin = padding;
  ymin = padding;
  ymax = canvas.height - craft.width - padding;

  craft.x = canvas.width / 2 - craft.width / 2;
  craft.y = canvas.height - craft.width - padding;
  craft.xDir = 0;
  craft.yDir = 0;
  ctx = canvas.getContext('2d');

  craft.path = new Path2D();
  craft.path.moveTo(0, craft.width);
  craft.path.lineTo(craft.width, craft.width);
  craft.path.lineTo(craft.width/2, 0);
  craft.path.closePath();

  //projectile.path = new Path2D();
  //projectile.path.moveTo(0, projectile.width);
  //projectile.path.lineTo(projectile.width, projectile.width);
  //projectile.path.closePath();

  window.requestAnimationFrame(draw);

  fpsOut = document.getElementById('fps');
  setInterval(drawFPS, fpsDrawInterval); 
}
document.body.onload = init;
