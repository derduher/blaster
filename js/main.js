(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fullScreen = require('./fullScreen');

const a = 65;
const d = 68;
const w = 87;
const s = 83;
const space = 32;
const left = 37;
const right = 39;
const up = 38;
const down = 40;
const esc = 27;

class Controls {
  constructor() {
    this.cfg = {};
    this.cfg[a] = this.cfg[left] = 'l';
    this.cfg[d] = this.cfg[right] = 'r';
    this.cfg[w] = this.cfg[up] = 'u';
    this.cfg[s] = this.cfg[down] = 'd';
    this.cfg[space] = 'f';
    this.cfg[esc] = 'toggleFS';
  }
  kd(e) {
    this[this.cfg[e.keyCode]] = true;
  }

  ku(e) {
    this[this.cfg[e.keyCode]] = false;
  }

  ts(e) {
    if (document[_fullScreen.fullScreenElementProp]) {
      this.touch = true;
      e.preventDefault();
    }
  }

  tm(e) {
    if (document[_fullScreen.fullScreenElementProp]) {
      var t = e.changedTouches[0];
      this.touchX = t.pageX;
      this.touchY = t.pageY;
      this.f = true;
      e.preventDefault();
    }
  }

  te(e) {
    this.touch = false;
    this.f = false;
    if (document[_fullScreen.fullScreenElementProp]) {
      e.preventDefault();
    }
  }
}
exports.default = Controls;

},{"./fullScreen":11}],2:[function(require,module,exports){
'use strict';
/* jshint bitwise: false*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Craft;

var _Geo = require('./Geo.js');

var _Geo2 = _interopRequireDefault(_Geo);

var _Point = require('./Point2.js');

var _Point2 = _interopRequireDefault(_Point);

var _Projectile = require('./Projectile.js');

var _Projectile2 = _interopRequireDefault(_Projectile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pSpeed = 50;

const speed = 5;
var posDir = speed;
var negDir = speed * -1;
function Craft(stage, ctrl) {
  this.geo = new _Geo2.default();
  this.stage = stage;
  this.lastFire = 0;
  this.boundToCanvas = true;
  this.width = 50;
  this.path = new Path2D();
  this.health = Number.POSITIVE_INFINITY;

  this.path.moveTo(0, this.width);
  this.geo.points.push(new _Point2.default(0, this.width));
  this.path.lineTo(this.width, this.width);
  this.geo.points.push(new _Point2.default(this.width, this.width));
  this.path.lineTo(this.width / 2, 0);
  this.geo.points.push(new _Point2.default(this.width / 2, 0));

  this.path.closePath();

  this.geo.aabb.min.x = 0;
  this.geo.aabb.min.y = 0;
  this.geo.aabb.max.x = this.width;
  this.geo.aabb.max.y = this.width;

  this.geo.pos.x = document.documentElement.clientWidth / 2 - this.width / 2;
  this.geo.pos.y = document.documentElement.clientHeight - this.width - stage.padding;
  this.ctrl = ctrl;
}

Craft.prototype.draw = function draw(ctx) {
  ctx.save();
  ctx.translate(this.geo.pos.x, this.geo.pos.y);
  ctx.stroke(this.path);
  ctx.restore();
};

Craft.prototype.tick = function tick(now) {
  var pdt = now - this.lastFire;

  // set ctrl dir
  if (this.ctrl.l && !this.ctrl.r) {
    this.geo.v.x = negDir;
  } else if (this.ctrl.r && !this.ctrl.l) {
    this.geo.v.x = posDir;
  } else {
    this.geo.v.x = 0;
  }

  // set ctrl dir
  if (this.ctrl.d && !this.ctrl.u) {
    this.geo.v.y = posDir;
  } else if (this.ctrl.u && !this.ctrl.d) {
    this.geo.v.y = negDir;
  } else {
    this.geo.v.y = 0;
  }
  if (this.ctrl.touch) {
    this.geo.pos.x = this.ctrl.touchX;
    this.geo.pos.y = this.ctrl.touchY;
  }

  if (this.ctrl.f && pdt > pSpeed) {
    let p = new _Projectile2.default(this);
    this.stage.items.push(p);
    this.stage.spatialManager.registerObject(p);
    this.lastFire = now;
  }
};

},{"./Geo.js":4,"./Point2.js":5,"./Projectile.js":6}],3:[function(require,module,exports){
'use strict';

// import Projectile from './Projectile.js'

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Stage = require('./Stage.js');

var _Stage2 = _interopRequireDefault(_Stage);

var _SpatialManager = require('./SpatialManager.js');

var _SpatialManager2 = _interopRequireDefault(_SpatialManager);

var _Roid = require('./Roid.js');

var _Roid2 = _interopRequireDefault(_Roid);

var _Craft = require('./Craft.js');

var _Craft2 = _interopRequireDefault(_Craft);

var _fullScreen = require('./fullScreen');

var _Controls = require('./Controls.js');

var _Controls2 = _interopRequireDefault(_Controls);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = {
  on: false,
  fps: 50,
  text: 0,
  numUpdates: 0,
  itemL: 0,
  drawRate: 250
};

const fpsFilter = 75;

class Game {
  constructor(canvas) {
    this.hitboxes = new Set();
    this.debug = debug;
    this.lastRender = window.performance.now();
    this.tickLength = 16.7;
    this.ctrl = new _Controls2.default();
    this.lastTick = this.lastRender;
    this.debug.lastRender = this.lastRender;
    this.stage = new _Stage2.default(canvas);
    this.started = false;

    this.isTouchInterface = 'ontouchend' in document.documentElement;

    this.stage.canvas.onclick = () => {
      if (this.isTouchInterface || this.started) {
        (0, _fullScreen.toggleFullScreen)(this.stage.canvas);
      }
      if (!this.started) {
        this.resume();
      }
    };
    document.addEventListener('keyup', this.pausedOnKeyUp.bind(this));
    document.addEventListener('keyup', this.ctrl.ku.bind(this.ctrl));
    document.onkeydown = this.ctrl.kd.bind(this.ctrl);
    document.ontouchstart = this.ctrl.ts.bind(this.ctrl);
    document.ontouchmove = this.ctrl.tm.bind(this.ctrl);
    document.addEventListener('touchend', this.ctrl.te.bind(this.ctrl));
    document.addEventListener('touchend', this.pausedOnTap.bind(this));
    window.onresize = () => this.updateCanvasBoundaries();

    this.stage.spatialManager = new _SpatialManager2.default(document.documentElement.clientWidth, document.documentElement.clientHeight, 109);

    this.craft = new _Craft2.default(this.stage, this.ctrl);
    this.stage.spatialManager.registerObject(this.craft);
    this.stage.items.push(this.craft);

    this.ctx = this.stage.canvas.getContext('2d');
    this.updateCanvasBoundaries();
    this.showInstructions();
  }

  main(tFrame) {
    this.started = true;
    var timeSinceTick;
    var nextTick = this.lastTick + this.tickLength;
    var numTicks = 0;
    var ud = 0;
    var thisFrameFPS = 60.1;

    this.stopMain = window.requestAnimationFrame(this.main.bind(this));

    if (this.debug.on) {
      ud = tFrame - this.debug.lastRender > this.debug.drawRate;

      if (ud) {
        thisFrameFPS = 1000 / (tFrame - this.lastRender);
        this.debug.fps += (thisFrameFPS - this.debug.fps) / fpsFilter;
        this.debug.lastRender = tFrame;
        this.debug.itemL = this.stage.items.length;
      }
    }

    if (this.ctrl.toggleFS) {
      this.pause();
      (0, _fullScreen.toggleFullScreen)();
    }

    // If tFrame < nextTick then 0 ticks need to be updated (0 is default for numTicks).
    // If tFrame = nextTick then 1 tick needs to be updated (and so forth).
    // Note: As we mention in summary, you should keep track of how large numTicks is.
    // If it is large, then either your game was asleep, or the machine cannot keep up.
    if (tFrame > nextTick) {
      timeSinceTick = tFrame - this.lastTick;
      numTicks = timeSinceTick / this.tickLength | 0;
      // if (numTicks !== 1) {
      // console.log(numTicks)
      // }
      if (numTicks > 4) {
        numTicks = 4;
      }
    }

    this.updates(numTicks);

    if (this.debug.on && ud) {
      this.debug.numUpdates = numTicks;
    }

    this.draw(tFrame);
    this.lastRender = tFrame;
  }

  updateCanvasBoundaries() {
    if (document[_fullScreen.fullScreenElementProp]) {
      this.stage.canvas.width = window.screen.width;
      this.stage.canvas.height = window.screen.height;
    } else {
      this.stage.canvas.width = document.documentElement.clientWidth;
      this.stage.canvas.height = document.documentElement.clientHeight;
    }
    this.stage.xmax = this.stage.canvas.width - this.stage.padding;
    this.stage.xmin = this.stage.padding;
    this.stage.ymin = this.stage.padding;
    this.stage.ymax = this.stage.canvas.height - this.stage.padding;

    this.hatches = new Path2D();
    let w = 109;
    let max = this.stage.canvas.width / w;
    if (this.stage.canvas.height / w > max) {
      max = this.stage.canvas.height / w;
    }
    // this.debug.text++
    // this.stage.items = []
    // for (var i=0; i<8; i++) {
    // for (var j=0;j < 5; j++) {
    // this.stage.items.push(new Roid(this.stage.canvas.width, i*90, j*90))
    // }
    // }
    this.stage.spatialManager = new _SpatialManager2.default(this.stage.canvas.width, this.stage.canvas.height, 109);
    this.stage.items.forEach(this.stage.spatialManager.registerObject, this.stage.spatialManager);
    if (this.started && !this.stopMain) {
      this.draw();
      this.showPause();
    }
  }

  updates(numTicks) {
    var i;
    for (i = 0; i < numTicks; i++) {
      this.lastTick += this.tickLength;
      this.update(this.lastTick);
    }
  }

  draw(tFrame) {
    this.ctx.clearRect(0, 0, this.stage.canvas.width, this.stage.canvas.height);
    var fs = 70;
    for (var i = 0; i < this.stage.items.length; i++) {
      this.stage.items[i].draw(this.ctx);
    }

    if (this.debug.on) {
      this.ctx.font = '64px roboto';
      this.ctx.fillText(this.debug.fps.toFixed(1), 0, fs);
      this.ctx.fillText(this.debug.itemL, 0, fs * 2);
      this.ctx.fillText(this.debug.numUpdates, 0, fs * 3);
      this.ctx.fillText(this.debug.text, this.stage.canvas.width / 2, this.stage.canvas.height / 2);

      this.ctx.stroke(this.hatches);
      this.ctx.save();
      this.ctx.strokeStyle = 'green';
      this.ctx.lineWidth = 3;
      this.hitboxes.forEach(xy => this.ctx.strokeRect(xy.x, xy.y, 109, 109));
      this.ctx.restore();
    }
  }

  boundNTick(i, tickTime) {
    i.tick(tickTime);
    var x = i.geo.pos.x + i.geo.v.x;
    var y = i.geo.pos.y + i.geo.v.y;
    var cull = false;

    if ((i.geo.v.x <= 0 || x < this.stage.xmax - i.width) && (i.geo.v.x >= 0 || x > this.stage.xmin) || !i.boundToCanvas && x < this.stage.xmax && x > -100) {
      i.geo.pos.x = x;
    } else if (!i.boundToCanvas) {
      cull = true;
    }
    if ((i.geo.v.y <= 0 || y < this.stage.ymax - i.width) && (i.geo.v.y >= 0 || y > this.stage.ymin) || !i.boundToCanvas && y < this.stage.ymax && y > -100) {
      i.geo.pos.y = y;
    } else if (!i.boundToCanvas) {
      cull = true;
    }
    if (!cull) {
      this.stage.spatialManager.registerObject(i);
    }
    return cull;
  }

  testIntersect(item, i, o, cullQ) {
    if (item.geo.intersectsWith(o.geo)) {
      item.health -= 200;
      if (item.health < 9) {
        cullQ.push(i);
      }
    }
  }

  update(tickTime) {
    var cullQ = [];
    if (Math.random() > 0.99) {
      this.stage.items.push(new _Roid2.default(this.stage.canvas.width));
    }
    this.stage.spatialManager.clearBuckets();
    for (let i = 0; i < this.stage.items.length; i++) {
      if (this.boundNTick(this.stage.items[i], tickTime)) {
        cullQ.push(i);
      }
    }

    this.hitboxes = new Set();
    var i, item;
    for (i = 0; i < this.stage.items.length; i++) {
      item = this.stage.items[i];
      let nearby = this.stage.spatialManager.getNearby(item.geo.pos.x | 0, item.geo.pos.y | 0, item.width | 0).values();
      while (1) {
        let o = nearby.next();
        if (o.done) {
          break;
        }
        this.testIntersect(item, i, o.value, cullQ);
      }
    }

    var culled = 0;
    cullQ.sort(function (a, b) {
      if (a < b) {
        return -1;
      }
      return a > b ? 1 : 0;
    });
    cullQ.forEach(v => this.stage.items.splice(v - culled++, 1));
  }

  messageModal(msg) {
    let x = this.stage.canvas.width / 2;
    let y = this.stage.canvas.height / 2;
    this.ctx.textAlign = 'center';
    this.ctx.save();
    this.ctx.font = '64px roboto';
    this.ctx.fillText(msg[0], x, y);
    this.ctx.restore();
    if (msg.length > 1) {
      this.ctx.save();
      this.ctx.font = '48px roboto';
      this.ctx.fillText(msg[1], x, y + 72);
      this.ctx.restore();
    }
  }

  showInstructions() {
    let msg = [];
    if (this.isTouchInterface) {
      msg[0] = 'Tap to start';
    } else {
      msg[0] = 'Click to start';
    }

    if (this.isTouchInterface) {
      msg[1] = 'drag to move the craft';
    } else {
      msg[1] = 'use wasd/arrow keys to move, spacebar to fire';
    }

    this.messageModal(msg);
  }

  showPause() {
    let msg = [];

    if (this.isTouchInterface) {
      msg[0] = 'Tap to resume';
    } else {
      msg[0] = 'Press space to resume';
    }

    this.messageModal(msg);
  }

  pausedOnKeyUp(e) {
    if (!this.stopMain && e.keyCode === 32) {
      this.resume();
    }
  }

  pausedOnTap(e) {
    if (!this.stopMain) {
      this.resume();
    }
  }

  pause() {
    window.cancelAnimationFrame(this.stopMain);
    this.stopMain = null;
    this.showPause();
  }

  resume() {
    // prevents the engine from trying to catch up from all the lost cycles
    // before pause
    this.lastTick = window.performance.now();
    this.main(this.lastTick);
  }
}
exports.default = Game;

},{"./Controls.js":1,"./Craft.js":2,"./Roid.js":7,"./SpatialManager.js":8,"./Stage.js":9,"./fullScreen":11}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Vector = require('./Vector2.js');

var _Vector2 = _interopRequireDefault(_Vector);

var _Point = require('./Point2.js');

var _Point2 = _interopRequireDefault(_Point);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Geo {
  constructor(x = 0, y = 0, dx = 0, dy = 0, ax = 0, ay = 0) {
    this.pos = new _Point2.default(x, y);
    this.v = new _Vector2.default(dx, dy);
    this.acc = new _Vector2.default(ax, ay);
    this.points = [];
    this.aabb = { min: new _Point2.default(), max: new _Point2.default() };
    this.treatAsPoint = false;
  }
  // This can probably be simplified.
  aabbIntersects(b) {
    let aminx = this.pos.x + this.aabb.min.x;
    let bminx = b.pos.x + b.aabb.min.x;
    let aminy = this.pos.y + this.aabb.min.y;
    let bminy = b.pos.y + b.aabb.min.y;
    // foo
    return (aminx < bminx && this.pos.x + this.aabb.max.x > bminx || bminx < aminx && b.pos.x + b.aabb.max.x > aminx) && (aminy < bminy && this.pos.y + this.aabb.max.y > bminy || bminy < aminy && b.pos.y + b.aabb.max.y > aminy);
    // return this.x > b.x && this.x < b.x + b.width && this.y > b.y && this.y < b.y + b.width
  }
  // http://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
  crossProduct(a, b) {
    return a.x * b.y - b.x * a.y;
  }
  isPointOnLine(aa, ab, b) {
    var aTmp = new _Point2.default(ab.x - aa.x, ab.y - aa.y);
    var bTmp = new _Point2.default(b.x - aa.x, b.y - aa.y);
    return Math.abs(this.crossProduct(aTmp, bTmp)) < Number.EPSILON;
  }
  isPointRightOfLine(aa, ab, b) {
    // Move the image, so that a.first is on (0|0)
    var aTmp = new _Point2.default(ab.x - aa.x, ab.y - aa.y);
    var bTmp = new _Point2.default(b.x - aa.x, b.y - aa.y);
    return this.crossProduct(aTmp, bTmp) < 0;
  }
  segmentTouchesOrCrosses(aa, ab, ba, bb) {
    return this.isPointOnLine(aa, ab, ba) || this.isPointOnLine(aa, ab, bb) || this.isPointRightOfLine(aa, ab, ba) ^ this.isPointRightOfLine(aa, ab, bb);
  }
  getSegmentBB(a, b) {
    return [new _Point2.default(Math.min(a.x, b.x), Math.min(a.y, b.y)), new _Point2.default(Math.max(a.x, b.x), Math.max(a.y, b.y))];
  }
  segmentsBBIntersect(aa, ab, ba, bb) {
    var firstbb = this.getSegmentBB(aa, ab);
    var secondbb = this.getSegmentBB(ba, bb);
    return firstbb[0].x <= secondbb[1].x && firstbb[1].x >= secondbb[0].x && firstbb[0].y <= secondbb[1].y && firstbb[1].y >= secondbb[0].y;
  }
  segmentsIntersect(aa, ab, ba, bb) {
    return this.segmentsBBIntersect(aa, ab, ba, bb) && this.segmentTouchesOrCrosses(aa, ab, ba, bb) && this.segmentTouchesOrCrosses(ba, bb, aa, ab);
  }
  pointsAtPos(points, pos) {
    var i;
    var atPos = [];
    for (i = 0; i < points.length; i++) {
      atPos[i] = new _Point2.default(points[i].x + pos.x, points[i].y + pos.y);
    }
    return atPos;
  }
  intersectsWith(ogeo) {
    var i;
    var oi;
    var collision = false;
    var points;
    var opoints;
    var point;
    var prev;
    var polyPos;
    var oprev;

    if (!this.aabbIntersects(ogeo)) {
      return false;
    } else if (this.treatAsPoint || ogeo.treatAsPoint) {
      if (this.treatAsPoint) {
        point = this;
        polyPos = ogeo.pos;
        points = ogeo.points;
      } else {
        point = ogeo;
        points = this.points;
        polyPos = this.pos;
      }
      point = new _Point2.default(point.pos.x + point.aabb.max.x / 2, point.pos.y + point.aabb.max.y / 2);
      // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
      for (i = 0, prev = points.length - 1; i < points.length; prev = i++) {
        if (polyPos.y + points[i].y > point.y !== polyPos.y + points[prev].y > point.y && point.x < (points[prev].x - points[i].x) * (point.y - (polyPos.y + points[i].y)) / (points[prev].y - points[i].y) + polyPos.x + points[i].x) {
          collision = !collision;
        }
      }
    } else {
      points = this.pointsAtPos(this.points, this.pos);
      opoints = ogeo.pointsAtPos(ogeo.points, ogeo.pos);
      for (i = 0, prev = points.length - 1; i < points.length; prev = i++) {
        for (oi = 0, oprev = opoints.length - 1; oi < opoints.length; oprev = oi++) {
          if (this.segmentsIntersect(points[i], points[prev], opoints[oi], opoints[oprev])) {
            collision = true;
            break;
          }
        }
        if (collision) {
          break;
        }
      }
    }
    return collision;
  }
}

exports.default = Geo; // line segments

},{"./Point2.js":5,"./Vector2.js":10}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class Point2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
exports.default = Point2;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Projectile;

var _Geo = require('./Geo.js');

var _Geo2 = _interopRequireDefault(_Geo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Projectile(craft) {
  var vy = -10 + craft.geo.v.y;
  this.geo = new _Geo2.default(craft.geo.pos.x + craft.width / 2, craft.geo.pos.y + vy, craft.geo.v.x, vy, -0.004, -0.004);
  this.width = 3;
  this.geo.aabb.min.x = 0;
  this.geo.aabb.min.y = 0;
  this.geo.aabb.max.x = this.width;
  this.geo.aabb.max.y = this.width;
  this.geo.treatAsPoint = true;
  this.health = 150;
  this.boundToCanvas = false;
}

Projectile.prototype.tick = function tick() {};

Projectile.prototype.draw = function draw(ctx) {
  ctx.save();
  ctx.translate(this.geo.pos.x, this.geo.pos.y);
  ctx.fillRect(0, 0, this.width, this.width);
  ctx.restore();
};

},{"./Geo.js":4}],7:[function(require,module,exports){
'use strict';
/* jshint bitwise: false*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Roid;

var _Geo = require('./Geo.js');

var _Geo2 = _interopRequireDefault(_Geo);

var _Point = require('./Point2.js');

var _Point2 = _interopRequireDefault(_Point);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getX(ang, mag) {
  return mag * Math.cos(ang);
}

function getY(ang, mag) {
  return mag * Math.sin(ang);
}

function getMag(max) {
  var extra = 0;
  if (Math.random() > 0.8) {
    extra = (-0.8 + Math.random()) * max * 0.25;
  }
  return 0.8125 * max + 3 * (-0.5 + Math.random()) + extra;
}

function Roid(cw) {
  this.color = 'black';
  this.geo = new _Geo2.default();

  this.path = new Path2D();
  var s = 3;
  var mrad = 4 + 28 * Math.random(); // max radius
  var numPoints = 12;

  // starting point
  var m = getMag(mrad); // magnitude
  var startX = s * (m + mrad);
  var startY = s * mrad;

  this.geo.aabb.min = {
    x: Number.POSITIVE_INFINITY,
    y: Number.POSITIVE_INFINITY
  };

  this.geo.aabb.max = {
    x: s * (m + mrad),
    y: Number.NEGATIVE_INFINITY
  };
  this.geo.points.push(new _Point2.default(startX, startY));
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
    this.geo.points.push(new _Point2.default(x, y));
    if (x > this.geo.aabb.max.x) {
      this.geo.aabb.max.x = x;
    } else if (x < this.geo.aabb.min.x) {
      this.geo.aabb.min.x = x;
    }
    // reverse order of x because its technically possible for
    // a completely ascending order of maxes
    if (y < this.geo.aabb.min.y) {
      this.geo.aabb.min.y = y;
    } else if (y > this.geo.aabb.max.y) {
      this.geo.aabb.max.y = y;
    }

    this.path.lineTo(x, y);
    i++;
  }
  this.path.lineTo(startX, startY);
  this.width = this.geo.aabb.max.x - this.geo.aabb.min.x;
  this.health = this.initialHealth = (0.5 + Math.random()) * this.width * this.width | 0;
  this.geo.pos.x = cw * Math.random();
  this.geo.pos.y = 0 - this.geo.aabb.max.y;
  this.geo.v.x = 0.2 * (-0.5 + Math.random());
  this.geo.v.y = Math.random();
}

Roid.prototype.tick = function tick() {};

Roid.prototype.draw = function draw(ctx) {
  ctx.save();
  ctx.strokeStyle = 'rgb(' + (148 + 107 * (1 - this.health / this.initialHealth) | 0) + ',0,234)';
  // ctx.fillStyle = this.color
  ctx.translate(this.geo.pos.x, this.geo.pos.y);
  ctx.stroke(this.path);
  ctx.restore();
};

},{"./Geo.js":4,"./Point2.js":5}],8:[function(require,module,exports){
'use strict';
/* jshint bitwise: false*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
class SpatialManager {
  constructor(scenewidth, sceneheight, cellsize) {
    this.SceneWidth = scenewidth;
    this.SceneHeight = sceneheight;
    this.cellsize = cellsize;
    this.cf = 1 / cellsize;

    this.cols = Math.ceil(scenewidth * this.cf);
    this.rows = Math.ceil(sceneheight * this.cf);
    this.buckets = new Map();
    this.numbuckets = this.rows * this.cols;
    this.reverse = {};

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.reverse[x + y * this.cols | 0] = { x: x * cellsize, y: y * cellsize };
      }
    }

    this.clearBuckets();
  }
  clearBuckets() {
    this.buckets.clear();
    var i;
    for (i = 0; i < this.numbuckets; i++) {
      this.buckets.set(i, new Set());
    }
  }
  registerObject(obj) {
    var cells = this.getIdForObject(obj.geo.pos.x | 0, obj.geo.pos.y | 0, obj.width | 0);
    var cell;
    for (var i = 0; i < cells.length; i++) {
      cell = this.buckets.get(cells[i]);
      if (cell) {
        cell.add(obj);
      }
    }
  }
  getIdForObject(x, y, radius) {
    var bucketsObjIsIn = [];
    var maxX = x + radius;
    var maxY = y + radius;
    var cf = this.cf;
    var cols = this.cols;

    for (let i = x; i <= maxX; i += this.cellsize) {
      for (let j = y; j <= maxY; j += this.cellsize) {
        this.addBucket(i, j, cf, cols, bucketsObjIsIn);
      }
    }

    return bucketsObjIsIn;
  }
  addBucket(x, y, cf, cols, set) {
    // ignore collisions offscreen
    var id = (x * cf | 0) + (y * cf | 0) * cols | 0;
    if (id >= 0 && id < this.numbuckets && set.indexOf(id) === -1) {
      set.push(id);
    }
  }
  getNearby(x, y, radius) {
    var nearby = new Set();
    var ids = this.getIdForObject(x, y, radius);

    var i;
    for (i = 0; i < ids.length; i++) {
      let bucket = this.buckets.get(ids[i]).values();
      var b;
      while (1) {
        b = bucket.next();
        if (b.done) {
          break;
        }
        nearby.add(b.value);
      }
    }
    return nearby;
  }
}
exports.default = SpatialManager;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class Stage {
  constructor(canvas) {
    this.items = [];
    this.spatialManager = null;
    this.canvas = canvas;
    this.padding = 3;
  }
}
exports.default = Stage;

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  dot(b) {
    return this.x * b.x + this.y * b.y;
  }
  cross(b) {
    return this.x * b.y - this.y * b.x;
  }
}
exports.default = Vector2;

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toggleFullScreen = toggleFullScreen;
var de = document.documentElement;
var fullScreenElementProp;

var requestFullScreen = de.requestFullscreen || de.mozRequestFullScreen || de.webkitRequestFullScreen || de.msRequestFullscreen;
var cancelFullScreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;

if (document.fullscreenElement !== undefined) {
  exports.fullScreenElementProp = fullScreenElementProp = 'fullscreenElement';
} else if (document.mozFullScreenElement !== undefined) {
  exports.fullScreenElementProp = fullScreenElementProp = 'mozFullScreenElement';
} else if (document.webkitFullscreenElement !== undefined) {
  exports.fullScreenElementProp = fullScreenElementProp = 'webkitFullscreenElement';
} else if (document.msFullscreenElement !== undefined) {
  exports.fullScreenElementProp = fullScreenElementProp = 'msFullscreenElement';
}

exports.fullScreenElementProp = fullScreenElementProp;
function toggleFullScreen(el) {
  if (el && !document[fullScreenElementProp]) {
    requestFullScreen.call(el);
  } else {
    cancelFullScreen.call(document);
  }
}

},{}],12:[function(require,module,exports){
'use strict';

var _Game = require('./Game');

var _Game2 = _interopRequireDefault(_Game);

var _visibility = require('./visibility');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init() {
  var game = new _Game2.default(document.getElementById('tutorial'));
  (0, _visibility.onVisibilityChange)(function (e) {
    if (game.started && document[_visibility.visProp]) {
      game.pause();
    }
  });
}

document.body.onload = init;

},{"./Game":3,"./visibility":13}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onVisibilityChange = onVisibilityChange;
var visProp = function getHiddenProp() {
  var prefixes = ['webkit', 'moz', 'ms', 'o'];

  // if 'hidden' is natively supported just return it
  if ('hidden' in document) {
    return 'hidden';
  }

  // otherwise loop over all the known prefixes until we find one
  for (var i = 0; i < prefixes.length; i++) {
    if (prefixes[i] + 'Hidden' in document) {
      return prefixes[i] + 'Hidden';
    }
  }

  // otherwise it's not supported
  return null;
}();

var evtname;
function onVisibilityChange(change) {
  if (visProp) {
    evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange';
    document.addEventListener(evtname, change);
  }
}
exports.visProp = visProp;

},{}]},{},[12]);
