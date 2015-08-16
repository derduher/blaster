'use strict';
/*jshint bitwise: false*/
// Code goes here
var xmin, xmax, ymin, ymax, canvas, ctx, fpsOut, itemsOut, craft, fps = 0,
  items = [],
  lastUpdate, fpsFilter = 60;
var enterFullScreen, de = document.documentElement;
lastUpdate = 0;

var debug, debugText = '';
var pSpeed = 50;

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
  left = 37,
  right = 39,
  up = 38,
  down = 40,
  padding = 3,
  esc = 27;

const speed = 0.2;
var posDir = speed;
var negDir = speed * -1;

var cfg = {};
cfg[a] = cfg[left] = 'l';
cfg[d] = cfg[right] = 'r';
cfg[w] = cfg[up] = 'u';
cfg[s] = cfg[down] = 'd';
cfg[space] = 'f';
cfg[esc] = 'toggleFS';

function Projectile (craft) {
  this.x = craft.x + craft.width / 2;
  this.y = craft.y - 2;
  this.width = 3;
  this.vx = craft.vx;
  this.vy = -0.5 + craft.vy;
  this.boundToCanvas = false;
}

Projectile.prototype.tick = function tick (dt, now) {
  this.vx *= (1 - dt * 0.0008);
  this.vy *= (1 - dt * 0.0008);
};

Projectile.prototype.draw = function draw (ctx) {
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.fillRect(0, 0, this.width, this.width);
  ctx.restore();
};

function Roid (cw) {
  this.width = (9 + 100 * Math.random()) | 0;
  this.health = this.initialHealth = (0.5 + Math.random()) * this.width * this.width | 0;
  this.x = cw * Math.random();
  this.y = 0 - this.width;
  this.vx = 0.02 * (-0.5 + Math.random());
  this.vy = 0.1 * Math.random();
  this.color = 'black';
  this.path = new Path2D();
  this.path.arc(this.width / 2, this.width / 2, this.width / 2, 0, Math.PI * 2);
}

Roid.prototype.tick = function tick (dt, now) {};

Roid.prototype.draw = function draw (ctx) {
  ctx.save();
  ctx.fillStyle = 'rgb(' + (148 + 107 * (1 - this.health / this.initialHealth) | 0) + ',0,234)';
  ctx.translate(this.x, this.y);
  ctx.fill(this.path);
  ctx.restore();
};

function Craft (canvasW, canvasH) {
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

  this.x = canvasW / 2 - this.width / 2;
  this.y = canvasH - this.width - padding;
}

Craft.prototype.draw = function draw (ctx) {
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.stroke(this.path);
  ctx.restore();
};

Craft.prototype.tick = function tick (dt, now) {
  var pdt = now - this.lastFire;

  // set ctrl dir
  if (ctrl.l && !ctrl.r) {
    this.vx = negDir;
  } else if (ctrl.r && !ctrl.l) {
    this.vx = posDir;
  } else {
    this.vx = 0;
  }

  // set ctrl dir
  if (ctrl.d && !ctrl.u) {
    this.vy = posDir;
  } else if (ctrl.u && !ctrl.d) {
    this.vy = negDir;
  } else {
    this.vy = 0;
  }

  if (ctrl.f && pdt > pSpeed) {
    items.push(new Projectile(this));
    this.lastFire = now;
  }
};

function kd (e) {
  ctrl[cfg[e.keyCode]] = true;
}

function ku (e) {
  ctrl[cfg[e.keyCode]] = false;
}

function tm (e) {
  var t = e.changedTouches[0];
  ctrl.l = (craft.x - t.pageX) > 5;
  ctrl.r = (craft.x - t.pageX) < -5;
  ctrl.u = (craft.y - t.pageY) > 5;
  ctrl.d = (craft.y - t.pageY) < -5;
  ctrl.f = true;
  canvas[enterFullScreen]();
  e.preventDefault();
}

function te (e) {
  ctrl.l = false;
  ctrl.r = false;
  ctrl.u = false;
  ctrl.d = false;
  ctrl.f = false;
  e.preventDefault();
}

function intersect (a, b) {
  return a.x > b.x && a.x < b.x + b.width && a.y > b.y && a.y < b.y + b.width;
}

function updateCanvasBoundaries () {
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  xmax = canvas.width - padding;
  xmin = padding;
  ymin = padding;
  ymax = canvas.height - padding;
}
if (de.requestFullscreen) {
  enterFullScreen = 'requestFullscreen';
} else if (de.msRequestFullscreen) {
  enterFullScreen = 'msRequestFullscreen';
} else if (de.mozRequestFullScreen) {
  enterFullScreen = 'mozRequestFullScreen';
} else if (de.webkitRequestFullscreen) {
  enterFullScreen = 'webkitRequestFullscreen';
}

function toggleFullScreen (el) {
  if (el && !document.fullscreenElement && // alternative standard method
    !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
    el[enterFullScreen]();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
  updateCanvasBoundaries();
}

function drawFPS () {
  ctx.fillText(fps.toFixed(1), 0, 18);
  ctx.fillText(items.length, 0, 36);
  ctx.fillText(debugText, 0, 54);
}

function draw (tFrame) {
  var dt;
  dt = tFrame - lastUpdate;
  if (dt) {
    var thisFrameFPS = 1000 / dt;
    fps += (thisFrameFPS - fps) / fpsFilter;

    lastUpdate = tFrame;
  }
  if (ctrl.toggleFS) {
    toggleFullScreen();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFPS();

  if (Math.random() > 0.99) {
    items.push(new Roid(canvas.width));
  }

  var cullQ = [];
  //console.log(items.length);
  items.forEach(function(i, idx, items) {
    i.tick(dt, tFrame);
    var x = i.x + i.vx * dt,
      y = i.y + i.vy * dt;

    if (((i.vx <= 0 || x < xmax - i.width) && (i.vx >= 0 || x > xmin)) ||
      !i.boundToCanvas && x < xmax && x > -100
    ) {
      i.x = x;
    } else if (!i.boundToCanvas) {
      cullQ.push(idx);
    }
    if (((i.vy <= 0 || y < ymax - i.width) && (i.vy >= 0 || y > ymin)) ||
      !i.boundToCanvas && y < ymax && y > -100
    ) {
      i.y = y;
    } else if (!i.boundToCanvas) {
      cullQ.push(idx);
    }

    if (i instanceof Projectile) {
      items.forEach(function (o, odx) {
        if (!(o instanceof Projectile) && intersect(i, o)) {
          if (o.boundToCanvas) {
            debugText = 'craftHit';
          }
          o.health -= 200;
          debugText = o.health;
          cullQ.push(idx);
          if (o.health < 9 && cullQ.indexOf(odx) === -1) {
            o.color = 'orange';
            cullQ.push(odx);
          }
        }
      });
    }

    i.draw(ctx);
  });

  var culled = 0;
  cullQ.sort(function (a, b) {
    if (a < b) {
      return -1;
    }
    return a > b ? 1 : 0;
  });
  cullQ.forEach(function (v) {
    items.splice(v - culled++, 1);
  });

  window.requestAnimationFrame(draw);
}

function init () {
  canvas = document.getElementById('tutorial');

  canvas.onclick = function () {
    toggleFullScreen(canvas);
  };
  updateCanvasBoundaries();
  document.onkeyup = ku;
  document.onkeydown = kd;
  document.ontouchmove = tm;
  document.ontouchend = te;

  craft = new Craft(canvas.width, canvas.height);
  items.push(craft);

  ctx = canvas.getContext('2d');
  ctx.font = '16px serif';

  window.requestAnimationFrame(draw);

  fpsOut = document.getElementById('fps');
  itemsOut = document.getElementById('items');
  debug = document.getElementById('debug');
}
document.body.onload = init;
