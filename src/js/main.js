'use strict';
/*jshint bitwise: false*/
// Code goes here
var canvas,
    hitboxes = [],
    ctx,
    enterFullScreen,
    de = document.documentElement,
    fpsFilter = 10,
    Game = {
      debug: {
        fps: 0,
        text: 0,
        numUpdates: 0,
        itemL: 0,
        drawRate: 250
      },
      lastRender: window.performance.now(),
      tickLength: 16.25
    },
    Stage = {items: [], spatialManager: null},
    hatches = new Path2D();

Game.lastTick = Game.lastRender;
Game.debug.lastRender = Game.lastRender;
Game.Stage = Stage;

Game.debug.text = 0;
var pSpeed = 50;
var fullScreenElementProp;

var ctrl = {};

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

const speed = 5;
var posDir = speed;
var negDir = speed * -1;

var cfg = {};
cfg[a] = cfg[left] = 'l';
cfg[d] = cfg[right] = 'r';
cfg[w] = cfg[up] = 'u';
cfg[s] = cfg[down] = 'd';
cfg[space] = 'f';
cfg[esc] = 'toggleFS';

// https://conkerjo.wordpress.com/2009/06/13/spatial-hashing-implementation-for-fast-2d-collisions/
class SpatialManager {
  constructor (scenewidth, sceneheight, cellsize) {
    this.SceneWidth = scenewidth;
    this.SceneHeight = sceneheight;
    this.cf = 1/cellsize;

    this.cols = Math.ceil(scenewidth*this.cf);
    this.rows = Math.ceil(sceneheight*this.cf);
    this.buckets = new Map();
    this.numbuckets = this.rows * this.cols;
    this.reverse = {};

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.reverse[x + y*this.cols |0] = {x:x*cellsize, y:y*cellsize};
      }
    }
    console.log(this.reverse);

    this.clearBuckets();
  }
  clearBuckets () {
    this.buckets.clear();
    var i;
    for (i = 0; i < this.numbuckets; i++) {
      this.buckets.set(i, new Set());
    }
  }
  registerObject (obj) {
    var cells = this.getIdForObject(obj);
    var cell, cellId;
    for (cellId of cells) {
      cell = this.buckets.get(cellId);
      if (cell) {
        cell.add(obj);
      }
    }
  }
  getIdForObject (obj) {
    var bucketsObjIsIn = new Set();

    var max = {
      x: obj.x + obj.width,
      y: obj.y + obj.width
    };

    //TopLeft
    this.addBucket(obj.x, obj.y, this.cf, this.cols, bucketsObjIsIn);
    //TopRight
    this.addBucket(max.x, obj.y, this.cf, this.cols, bucketsObjIsIn);
    //BottomRight
    this.addBucket(max.x, max.y, this.cf, this.cols, bucketsObjIsIn);
    //BottomLeft
    this.addBucket(obj.x, max.y, this.cf, this.cols, bucketsObjIsIn);

    return bucketsObjIsIn;
  }
  addBucket (x, y, cf, cols, set) {
    // ignore collisions offscreen
    var id = (x*cf | 0) + (y*cf |0)*cols |0;
    if (id >= 0 && id < this.numbuckets) {
      set.add(id);
    }
  }
  getNearby (obj) {
    var id;
    var nearby = new Set();
    var ids = this.getIdForObject(obj);

    for (id of ids) {
      let bucket = this.buckets.get(id);
      for (let oobj of bucket) {
        nearby.add(oobj);
      }
    }
    return nearby;
  }
}

function Projectile (craft) {
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

function Roid (cw) {
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

Craft.prototype.tick = function tick (now) {
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
    let p = new Projectile(this);
    Stage.items.push(p);
    Stage.spatialManager.registerObject(p);
    this.lastFire = now;
  }
};

function kd (e) {
  ctrl[cfg[e.keyCode]] = true;
}

function ku (e) {
  ctrl[cfg[e.keyCode]] = false;
}

function ts (e) {
  if (document[fullScreenElementProp]) {
    e.preventDefault();
  }
}

function tm (e) {
  if (document[fullScreenElementProp]) {
    var t = e.changedTouches[0];
    var w2 = Game.craft.width / 2;
    ctrl.l = (Game.craft.x + w2 - t.pageX) > 5;
    ctrl.r = (Game.craft.x + w2 - t.pageX) < -5;
    ctrl.u = (Game.craft.y + Game.craft.width + w2 - t.pageY) > 5;
    ctrl.d = (Game.craft.y + Game.craft.width + w2 - t.pageY) < -5;
    ctrl.f = true;
    e.preventDefault();
  }
}

function te (e) {
  ctrl.l = false;
  ctrl.r = false;
  ctrl.u = false;
  ctrl.d = false;
  ctrl.f = false;
  if (document[fullScreenElementProp]) {
    e.preventDefault();
  }
}

function intersect (a, b) {
  return a.x > b.x && a.x < b.x + b.width && a.y > b.y && a.y < b.y + b.width;
}

function updateCanvasBoundaries () {
  if (document[fullScreenElementProp]) {
    canvas.width = window.screen.width;
    canvas.height = window.screen.height;
  } else {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  }
  Stage.xmax = canvas.width - padding;
  Stage.xmin = padding;
  Stage.ymin = padding;
  Stage.ymax = canvas.height - padding;

  hatches = new Path2D();
  let w = 109;
  let max = canvas.width / w;
  if (canvas.height /w > max) {
    max = canvas.height/w;
  }
  for (var i = 1; i < max; i++) {
    hatches.moveTo(i * w, 0);
    hatches.lineTo(i * w, canvas.height);
    hatches.moveTo(0, i*w);
    hatches.lineTo(canvas.width, i*w);
  }
  hatches.closePath();
  Game.debug.text++;
  Stage.spatialManager = new SpatialManager(canvas.width, canvas.height, 109);
  Stage.items.forEach(Stage.spatialManager.registerObject, Stage.spatialManager);
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
if (document.fullscreenElement !== undefined) {
  fullScreenElementProp = 'fullscreenElement';
} else if (document.mozFullScreenElement !== undefined) {
  fullScreenElementProp = 'mozFullScreenElement';
} else if (document.webkitFullscreenElement !== undefined) {
  fullScreenElementProp = 'webkitFullscreenElement';
} else if (document.msFullscreenElement !== undefined) {
  fullScreenElementProp = 'msFullscreenElement';
}


function toggleFullScreen (el) {
  if (el && !document[fullScreenElementProp]) { // current working methods
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
}

function draw (tFrame, dt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var fs = 70;
  Stage.items.forEach(function(i, idx, items) {
    i.draw(ctx);
  });

  ctx.font = '64px roboto';
  ctx.fillText(Game.debug.fps.toFixed(1), 0, fs);
  ctx.fillText(Game.debug.itemL, 0, fs * 2);
  ctx.fillText(Game.debug.numUpdates, 0, fs * 3);
  ctx.fillText(Game.debug.text, canvas.width / 2, canvas.height /2);

  ctx.stroke(hatches);
  ctx.save();
  ctx.strokeStyle = 'green';
  ctx.lineWidth = 3;
  hitboxes.forEach(function (xy) {
    ctx.strokeRect(xy.x, xy.y, 109, 109);
  });
  ctx.restore();
}

function update (tickTime) {
  var cullQ = [];
  if (Math.random() > 0.9) {
    Stage.items.push(new Roid(canvas.width));
  }
  Stage.spatialManager.clearBuckets();
  Stage.items.forEach(function(i, idx, items) {
    i.tick(tickTime);
    var x = i.x + i.vx,
      y = i.y + i.vy;

    if (((i.vx <= 0 || x < Stage.xmax - i.width) && (i.vx >= 0 || x > Stage.xmin)) ||
      !i.boundToCanvas && x < Stage.xmax && x > -100
    ) {
      i.x = x;
    } else if (!i.boundToCanvas) {
      cullQ.push(idx);
    }
    if (((i.vy <= 0 || y < Stage.ymax - i.width) && (i.vy >= 0 || y > Stage.ymin)) ||
      !i.boundToCanvas && y < Stage.ymax && y > -100
    ) {
      i.y = y;
    } else if (!i.boundToCanvas) {
      cullQ.push(idx);
    }
    if (cullQ[cullQ.length - 1] !== idx) {
      Stage.spatialManager.registerObject(i);
    }

  });

  hitboxes = [];
  Stage.items.forEach(function(i, idx, items) {
    //if (i instanceof Projectile) {
      Stage.spatialManager.getNearby(i).forEach(function (o) {
        //if (!(o instanceof Projectile)) {
          let ids = Stage.spatialManager.getIdForObject(o);
          for (let id of ids) {
            hitboxes.push(Stage.spatialManager.reverse[id]);
          }
        //}
        //if (!(o instanceof Projectile) && intersect(i, o)) {
        if (intersect(i, o)) {
          if (o.boundToCanvas) {
            Game.debug.text = 'craftHit';
          }
          o.health -= 200;
          i.health -= 200;
          let odx;
          if (o.health < 9 && cullQ.indexOf((odx = Stage.items.indexOf(o))) === -1) {
            cullQ.push(odx);
          } else if (i.health < 9 && cullQ.indexOf(idx) === -1) {
            cullQ.push(idx);
          }
        }
      });
    //}
  });

  var culled = 0;
  cullQ.sort(function (a, b) {
    if (a < b) {
      return -1;
    }
    return a > b ? 1 : 0;
  });
  cullQ.forEach(function (v) {
    Stage.items.splice(v - culled++, 1);
  });
}

function updates (numTicks) {
  var i;
  for (i=0; i < numTicks; i++) {
    Game.lastTick += Game.tickLength;
    update(Game.lastTick);
  }
}

function main (tFrame) {
  var dt,
      timeSinceTick,
      thisFrameFPS,
      nextTick = Game.lastTick + Game.tickLength,
      numTicks = 0;

  Game.stopMain = window.requestAnimationFrame(main);

  dt = tFrame - Game.lastRender;
  var ud = tFrame - Game.debug.lastRender > Game.debug.drawRate;

  if (ud) {
    thisFrameFPS = 1000 / dt;
    Game.debug.fps += (thisFrameFPS - Game.debug.fps) / fpsFilter;
    Game.debug.lastRender = tFrame;
    Game.debug.itemL = Stage.items.length;
  }

  if (ctrl.toggleFS) {
    toggleFullScreen();
  }

  //If tFrame < nextTick then 0 ticks need to be updated (0 is default for numTicks).
  //If tFrame = nextTick then 1 tick needs to be updated (and so forth).
  //Note: As we mention in summary, you should keep track of how large numTicks is.
  //If it is large, then either your game was asleep, or the machine cannot keep up.
  if (tFrame > nextTick) {
    timeSinceTick = tFrame - Game.lastTick;
    numTicks = (timeSinceTick / Game.tickLength) | 0;
  }
  updates(numTicks);
  if (ud) {
    Game.debug.numUpdates = numTicks;
  }

  draw(tFrame);
  Game.lastRender = tFrame;
}

function init () {
  canvas = document.getElementById('tutorial');

  canvas.onclick = function () {
    toggleFullScreen(canvas);
  };
  window.onresize = function () {
    updateCanvasBoundaries();
  };
  updateCanvasBoundaries();
  document.onkeyup = ku;
  document.onkeydown = kd;
  document.ontouchstart = ts;
  document.ontouchmove = tm;
  document.ontouchend = te;
  Stage.spatialManager = new SpatialManager(canvas.width, canvas.height, 109);

  Game.craft = new Craft(canvas.width, canvas.height);
  Stage.spatialManager.registerObject(Game.craft);
  Stage.items.push(Game.craft);

  ctx = canvas.getContext('2d');

  window.requestAnimationFrame(main);

}
var hidden = 'hidden';

function onVisibilityChange (evt) {
  var evtMap = {
        focus:true, focusin:true, pageshow:true, blur:false, focusout:false, pagehide:false
      };

  evt = evt || window.event;
  if (evt.type in evtMap) {
    if (evtMap[evt.type]) {
      main(window.performance.now());
    } else {
      window.cancelAnimationFrame(Game.stopMain);
    }
  } else {
    /*jshint validthis: true */
    if (this[hidden]) {
      window.cancelAnimationFrame(Game.stopMain);
    } else {
      main(window.performance.now());
    }
    /*jshint validthis: false */
  }
}
// Standards:
if (hidden in document) {
  document.addEventListener('visibilitychange', onVisibilityChange);
} else if ((hidden = 'mozHidden') in document) {
  document.addEventListener('mozvisibilitychange', onVisibilityChange);
} else if ((hidden = 'webkitHidden') in document) {
  document.addEventListener('webkitvisibilitychange', onVisibilityChange);
} else if ((hidden = 'msHidden') in document) {
  document.addEventListener('msvisibilitychange', onVisibilityChange);
} else if ('onfocusin' in document) {
// IE 9 and lower:
  document.onfocusin = document.onfocusout = onVisibilityChange;
} else {
// All others:
  window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onVisibilityChange;
}
document.body.onload = init;
