(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fullScreen = require('./fullScreen');

var a = 65;
var d = 68;
var w = 87;
var s = 83;
var space = 32;
var left = 37;
var right = 39;
var up = 38;
var down = 40;
var esc = 27;

var Controls = (function () {
  function Controls() {
    _classCallCheck(this, Controls);

    this.cfg = {};
    this.cfg[a] = this.cfg[left] = 'l';
    this.cfg[d] = this.cfg[right] = 'r';
    this.cfg[w] = this.cfg[up] = 'u';
    this.cfg[s] = this.cfg[down] = 'd';
    this.cfg[space] = 'f';
    this.cfg[esc] = 'toggleFS';
  }

  _createClass(Controls, [{
    key: 'kd',
    value: function kd(e) {
      this[this.cfg[e.keyCode]] = true;
    }
  }, {
    key: 'ku',
    value: function ku(e) {
      this[this.cfg[e.keyCode]] = false;
    }
  }, {
    key: 'ts',
    value: function ts(e) {
      if (document[_fullScreen.fullScreenElementProp]) {
        this.touch = true;
        e.preventDefault();
      }
    }
  }, {
    key: 'tm',
    value: function tm(e) {
      if (document[_fullScreen.fullScreenElementProp]) {
        var t = e.changedTouches[0];
        this.touchX = t.pageX;
        this.touchY = t.pageY;
        this.f = true;
        e.preventDefault();
      }
    }
  }, {
    key: 'te',
    value: function te(e) {
      this.touch = false;
      this.f = false;
      if (document[_fullScreen.fullScreenElementProp]) {
        e.preventDefault();
      }
    }
  }]);

  return Controls;
})();

exports['default'] = Controls;
module.exports = exports['default'];

},{"./fullScreen":10}],2:[function(require,module,exports){
'use strict';
/* jshint bitwise: false*/
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = Craft;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GeoJs = require('./Geo.js');

var _GeoJs2 = _interopRequireDefault(_GeoJs);

var _Point2Js = require('./Point2.js');

var _Point2Js2 = _interopRequireDefault(_Point2Js);

var _ProjectileJs = require('./Projectile.js');

var _ProjectileJs2 = _interopRequireDefault(_ProjectileJs);

var pSpeed = 50;

var speed = 5;
var posDir = speed;
var negDir = speed * -1;

function Craft(stage, ctrl) {
  this.geo = new _GeoJs2['default']();
  this.stage = stage;
  this.lastFire = 0;
  this.boundToCanvas = true;
  this.width = 50;
  this.path = new Path2D();
  this.health = Number.POSITIVE_INFINITY;

  this.path.moveTo(0, this.width);
  this.geo.points.push(new _Point2Js2['default'](0, this.width));
  this.path.lineTo(this.width, this.width);
  this.geo.points.push(new _Point2Js2['default'](this.width, this.width));
  this.path.lineTo(this.width / 2, 0);
  this.geo.points.push(new _Point2Js2['default'](0, this.width / 2));

  this.path.closePath();

  this.geo.aabb.min.x = 0;
  this.geo.aabb.min.y = 0;
  this.geo.aabb.max.x = this.width;
  this.geo.aabb.max.y = this.width;

  this.geo.pos.x = stage.canvas.width / 2 - this.width / 2;
  this.geo.pos.y = stage.canvas.height - this.width - stage.padding;
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
    var p = new _ProjectileJs2['default'](this);
    this.stage.items.push(p);
    this.stage.spatialManager.registerObject(p);
    this.lastFire = now;
  }
};
module.exports = exports['default'];

},{"./Geo.js":4,"./Point2.js":5,"./Projectile.js":6}],3:[function(require,module,exports){
'use strict';
/* jshint bitwise: false*/

// import Projectile from './Projectile.js'
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

// const fpsFilter = 75

var _SpatialManagerJs = require('./SpatialManager.js');

var _SpatialManagerJs2 = _interopRequireDefault(_SpatialManagerJs);

var _RoidJs = require('./Roid.js');

var _RoidJs2 = _interopRequireDefault(_RoidJs);

var _CraftJs = require('./Craft.js');

var _CraftJs2 = _interopRequireDefault(_CraftJs);

var _fullScreen = require('./fullScreen');

var _ControlsJs = require('./Controls.js');

var _ControlsJs2 = _interopRequireDefault(_ControlsJs);

var debug = {
  on: true,
  fps: 50,
  text: 0,
  numUpdates: 0,
  itemL: 0,
  drawRate: 250
};
var Game = (function () {
  function Game(canvas) {
    var _this = this;

    _classCallCheck(this, Game);

    this.hitboxes = new Set();
    this.debug = debug;
    this.lastRender = window.performance.now();
    this.tickLength = 16.7;
    this.ctrl = new _ControlsJs2['default']();
    this.lastTick = this.lastRender;
    this.debug.lastRender = this.lastRender;
    this.stage = { items: [], spatialManager: null, canvas: null, padding: 3 };

    this.stage.canvas = canvas;

    this.stage.canvas.onclick = function () {
      return (0, _fullScreen.toggleFullScreen)(_this.stage.canvas);
    };
    window.onresize = function () {
      return _this.updateCanvasBoundaries();
    };
    this.updateCanvasBoundaries();
    document.onkeyup = this.ctrl.ku.bind(this.ctrl);
    document.onkeydown = this.ctrl.kd.bind(this.ctrl);
    document.ontouchstart = this.ctrl.ts.bind(this.ctrl);
    document.ontouchmove = this.ctrl.tm.bind(this.ctrl);
    document.ontouchend = this.ctrl.te.bind(this.ctrl);
    this.stage.spatialManager = new _SpatialManagerJs2['default'](this.stage.canvas.width, this.stage.canvas.height, 109);

    this.craft = new _CraftJs2['default'](this.stage, this.ctrl);
    this.stage.spatialManager.registerObject(this.craft);
    this.stage.items.push(this.craft);

    this.ctx = this.stage.canvas.getContext('2d');

    window.requestAnimationFrame(this.main.bind(this));
  }

  _createClass(Game, [{
    key: 'main',
    value: function main(tFrame) {
      var timeSinceTick;
      var nextTick = this.lastTick + this.tickLength;
      var numTicks = 0;

      this.stopMain = window.requestAnimationFrame(this.main.bind(this));

      // if (this.debug.on) {
      // ud = tFrame - this.debug.lastRender > this.debug.drawRate

      // if (ud) {
      // thisFrameFPS = 1000 / (tFrame - this.lastRender)
      // this.debug.fps += (thisFrameFPS - this.debug.fps) / fpsFilter
      // this.debug.lastRender = tFrame
      // this.debug.itemL = this.stage.items.length
      // }
      // }

      if (this.ctrl.toggleFS) {
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
      // if (this.debug.on && ud) {
      // this.debug.numUpdates = numTicks
      // }

      this.draw(tFrame);
      this.lastRender = tFrame;
    }
  }, {
    key: 'updateCanvasBoundaries',
    value: function updateCanvasBoundaries() {
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
      var w = 109;
      var max = this.stage.canvas.width / w;
      if (this.stage.canvas.height / w > max) {
        max = this.stage.canvas.height / w;
      }
      this.debug.text++;
      // this.stage.items = []
      // for (var i=0; i<8; i++) {
      // for (var j=0;j < 5; j++) {
      // this.stage.items.push(new Roid(this.stage.canvas.width, i*90, j*90))
      // }
      // }
      this.stage.spatialManager = new _SpatialManagerJs2['default'](this.stage.canvas.width, this.stage.canvas.height, 109);
      this.stage.items.forEach(this.stage.spatialManager.registerObject, this.stage.spatialManager);
    }
  }, {
    key: 'updates',
    value: function updates(numTicks) {
      var i;
      for (i = 0; i < numTicks; i++) {
        this.lastTick += this.tickLength;
        this.update(this.lastTick);
      }
    }
  }, {
    key: 'draw',
    value: function draw(tFrame) {
      this.ctx.clearRect(0, 0, this.stage.canvas.width, this.stage.canvas.height);
      // var fs = 70
      for (var i = 0; i < this.stage.items.length; i++) {
        this.stage.items[i].draw(this.ctx);
      }

      /*
      if (this.debug.on) {
        this.ctx.font = '64px roboto'
        this.ctx.fillText(this.debug.fps.toFixed(1), 0, fs)
        this.ctx.fillText(this.debug.itemL, 0, fs * 2)
        this.ctx.fillText(this.debug.numUpdates, 0, fs * 3)
        this.ctx.fillText(this.debug.text, this.stage.canvas.width / 2, this.stage.canvas.height /2)
         this.ctx.stroke(this.hatches)
        this.ctx.save()
        this.ctx.strokeStyle = 'green'
        this.ctx.lineWidth = 3
        this.hitboxes.forEach (xy => this.ctx.strokeRect(xy.x, xy.y, 109, 109))
        this.ctx.restore()
      }
      */
    }
  }, {
    key: 'boundNTick',
    value: function boundNTick(i, tickTime) {
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
  }, {
    key: 'testIntersect',
    value: function testIntersect(item, i, o, cullQ) {
      if (item.geo.intersectsWith(o.geo)) {
        item.health -= 200;
        if (item.health < 9) {
          cullQ.push(i);
        }
      }
    }
  }, {
    key: 'update',
    value: function update(tickTime) {
      var _this2 = this;

      var cullQ = [];
      if (Math.random() > 0.99) {
        this.stage.items.push(new _RoidJs2['default'](this.stage.canvas.width));
      }
      this.stage.spatialManager.clearBuckets();
      for (var _i = 0; _i < this.stage.items.length; _i++) {
        if (this.boundNTick(this.stage.items[_i], tickTime)) {
          cullQ.push(_i);
        }
      }

      this.hitboxes = new Set();
      var i, item;
      for (i = 0; i < this.stage.items.length; i++) {
        item = this.stage.items[i];
        var nearby = this.stage.spatialManager.getNearby(item.x | 0, item.y | 0, item.width | 0).values();
        while (1) {
          var o = nearby.next();
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
      cullQ.forEach(function (v) {
        return _this2.stage.items.splice(v - culled++, 1);
      });
    }
  }, {
    key: 'pause',
    value: function pause() {
      window.cancelAnimationFrame(this.stopMain);
    }
  }, {
    key: 'resume',
    value: function resume() {
      this.main(window.performance.now());
    }
  }]);

  return Game;
})();

exports['default'] = Game;
module.exports = exports['default'];

},{"./Controls.js":1,"./Craft.js":2,"./Roid.js":7,"./SpatialManager.js":8,"./fullScreen":10}],4:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Vector2Js = require('./Vector2.js');

var _Vector2Js2 = _interopRequireDefault(_Vector2Js);

var _Point2Js = require('./Point2.js');

var _Point2Js2 = _interopRequireDefault(_Point2Js);

var Geo = (function () {
  function Geo() {
    var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var dx = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var dy = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
    var ax = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];
    var ay = arguments.length <= 5 || arguments[5] === undefined ? 0 : arguments[5];

    _classCallCheck(this, Geo);

    this.pos = new _Point2Js2['default'](x, y);
    this.v = new _Vector2Js2['default'](dx, dy);
    this.acc = new _Vector2Js2['default'](ax, ay);
    this.points = [];
    this.aabb = { min: new _Point2Js2['default'](), max: new _Point2Js2['default']() };
    this.treatAsPoint = false;
  }

  // line segments

  // This can probably be simplified.

  _createClass(Geo, [{
    key: 'aabbIntersects',
    value: function aabbIntersects(b) {
      var aminx = this.pos.x + this.aabb.min.x;
      var bminx = b.pos.x + b.aabb.min.x;
      var aminy = this.pos.y + this.aabb.min.y;
      var bminy = b.pos.y + b.aabb.min.y;
      // foo
      return (aminx < bminx && this.pos.x + this.aabb.max.x > bminx || bminx < aminx && b.pos.x + b.aabb.max.x > aminx) && (aminy < bminy && this.pos.y + this.aabb.max.y > bminy || bminy < aminy && b.pos.y + b.aabb.max.y > aminy);
      // return this.x > b.x && this.x < b.x + b.width && this.y > b.y && this.y < b.y + b.width
    }

    // http://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
  }, {
    key: 'crossProduct',
    value: function crossProduct(a, b) {
      return a.x * b.y - b.x * a.y;
    }
  }, {
    key: 'isPointOnLine',
    value: function isPointOnLine(aa, ab, b) {
      var aTmp = new _Point2Js2['default'](ab.x - aa.x, ab.y - aa.y);
      var bTmp = new _Point2Js2['default'](b.x - aa.x, b.y - aa.y);
      return Math.abs(this.crossProduct(aTmp, bTmp)) < Number.EPSILON;
    }
  }, {
    key: 'isPointRightOfLine',
    value: function isPointRightOfLine(aa, ab, b) {
      // Move the image, so that a.first is on (0|0)
      var aTmp = new _Point2Js2['default'](ab.x - aa.x, ab.y - aa.y);
      var bTmp = new _Point2Js2['default'](b.x - aa.x, b.y - aa.y);
      return this.crossProduct(aTmp, bTmp) < 0;
    }
  }, {
    key: 'segmentTouchesOrCrosses',
    value: function segmentTouchesOrCrosses(aa, ab, ba, bb) {
      return this.isPointOnLine(aa, ab, ba) || this.isPointOnLine(aa, ab, bb) || this.isPointRightOfLine(aa, ab, ba) ^ this.isPointRightOfLine(aa, ab, bb);
    }
  }, {
    key: 'getSegmentBB',
    value: function getSegmentBB(a, b) {
      return [new _Point2Js2['default'](Math.min(a.x, b.x), Math.min(a.y, b.y)), new _Point2Js2['default'](Math.max(a.x, b.x), Math.max(a.y, b.y))];
    }
  }, {
    key: 'segmentsBBIntersect',
    value: function segmentsBBIntersect(aa, ab, ba, bb) {
      var firstbb = this.getSegmentBB(aa, ab);
      var secondbb = this.getSegmentBB(ba, bb);
      return firstbb[0].x <= secondbb[1].x && firstbb[1].x >= secondbb[0].x && firstbb[0].y <= secondbb[1].y && firstbb[1].y >= secondbb[0].y;
    }
  }, {
    key: 'segmentsIntersect',
    value: function segmentsIntersect(aa, ab, ba, bb) {
      return this.segmentsBBIntersect(aa, ab, ba, bb) && this.segmentTouchesOrCrosses(aa, ab, ba, bb) && this.segmentTouchesOrCrosses(ba, bb, aa, ab);
    }
  }, {
    key: 'pointsAtPos',
    value: function pointsAtPos(points, pos) {
      var i;
      var atPos = [];
      for (i = 0; i < points.length; i++) {
        atPos[i] = new _Point2Js2['default'](points[i].x + pos.x, points[i].y + pos.y);
      }
      return atPos;
    }
  }, {
    key: 'intersectsWith',
    value: function intersectsWith(ogeo) {
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
        point = new _Point2Js2['default'](point.pos.x + point.aabb.max.x / 2, point.pos.y + point.aabb.max.y / 2);
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
  }]);

  return Geo;
})();

exports['default'] = Geo;
module.exports = exports['default'];

},{"./Point2.js":5,"./Vector2.js":9}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Point2 = function Point2() {
  var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
  var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  _classCallCheck(this, Point2);

  this.x = x;
  this.y = y;
};

exports['default'] = Point2;
module.exports = exports['default'];

},{}],6:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = Projectile;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GeoJs = require('./Geo.js');

var _GeoJs2 = _interopRequireDefault(_GeoJs);

function Projectile(craft) {
  var vy = -10 + craft.geo.v.y;
  this.geo = new _GeoJs2['default'](craft.geo.pos.x + craft.width / 2, craft.geo.pos.y + vy, craft.geo.v.x, vy, -0.004, -0.004);
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
module.exports = exports['default'];

},{"./Geo.js":4}],7:[function(require,module,exports){
'use strict';
/* jshint bitwise: false*/
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = Roid;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GeoJs = require('./Geo.js');

var _GeoJs2 = _interopRequireDefault(_GeoJs);

var _Point2Js = require('./Point2.js');

var _Point2Js2 = _interopRequireDefault(_Point2Js);

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
  this.geo = new _GeoJs2['default']();

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
  this.geo.points.push(new _Point2Js2['default'](startX, startY));
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
    this.geo.points.push(new _Point2Js2['default'](x, y));
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
module.exports = exports['default'];

},{"./Geo.js":4,"./Point2.js":5}],8:[function(require,module,exports){
'use strict';
/* jshint bitwise: false*/
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var SpatialManager = (function () {
  function SpatialManager(scenewidth, sceneheight, cellsize) {
    _classCallCheck(this, SpatialManager);

    this.SceneWidth = scenewidth;
    this.SceneHeight = sceneheight;
    this.cf = 1 / cellsize;

    this.cols = Math.ceil(scenewidth * this.cf);
    this.rows = Math.ceil(sceneheight * this.cf);
    this.buckets = new Map();
    this.numbuckets = this.rows * this.cols;
    this.reverse = {};

    for (var y = 0; y < this.rows; y++) {
      for (var x = 0; x < this.cols; x++) {
        this.reverse[x + y * this.cols | 0] = { x: x * cellsize, y: y * cellsize };
      }
    }

    this.clearBuckets();
  }

  _createClass(SpatialManager, [{
    key: 'clearBuckets',
    value: function clearBuckets() {
      this.buckets.clear();
      var i;
      for (i = 0; i < this.numbuckets; i++) {
        this.buckets.set(i, new Set());
      }
    }
  }, {
    key: 'registerObject',
    value: function registerObject(obj) {
      var cells = this.getIdForObject(obj.x | 0, obj.y | 0, obj.width | 0);
      var cell;
      for (var i = 0; i < cells.length; i++) {
        cell = this.buckets.get(cells[i]);
        if (cell) {
          cell.add(obj);
        }
      }
    }
  }, {
    key: 'getIdForObject',
    value: function getIdForObject(x, y, width) {
      var bucketsObjIsIn = [];
      var maxX = x + width;
      var maxY = y + width;
      var cf = this.cf;
      var cols = this.cols;

      // TopLeft
      this.addBucket(x, y, cf, cols, bucketsObjIsIn);
      // TopRight
      this.addBucket(maxX, y, cf, cols, bucketsObjIsIn);
      // BottomRight
      this.addBucket(maxX, maxY, cf, cols, bucketsObjIsIn);
      // BottomLeft
      this.addBucket(x, maxY, cf, cols, bucketsObjIsIn);

      return bucketsObjIsIn;
    }
  }, {
    key: 'addBucket',
    value: function addBucket(x, y, cf, cols, set) {
      // ignore collisions offscreen
      var id = (x * cf | 0) + (y * cf | 0) * cols | 0;
      if (id >= 0 && id < this.numbuckets && set.indexOf(id) === -1) {
        set.push(id);
      }
    }
  }, {
    key: 'getNearby',
    value: function getNearby(x, y, width) {
      var nearby = new Set();
      var ids = this.getIdForObject(x, y, width);

      var i;
      for (i = 0; i < ids.length; i++) {
        var bucket = this.buckets.get(ids[i]).values();
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
  }]);

  return SpatialManager;
})();

exports['default'] = SpatialManager;
module.exports = exports['default'];

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Vector2 = (function () {
  function Vector2() {
    var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    _classCallCheck(this, Vector2);

    this.x = x;
    this.y = y;
  }

  _createClass(Vector2, [{
    key: 'dot',
    value: function dot(b) {
      return this.x * b.x + this.y * b.y;
    }
  }, {
    key: 'cross',
    value: function cross(b) {
      return this.x * b.y - this.y * b.x;
    }
  }]);

  return Vector2;
})();

exports['default'] = Vector2;
module.exports = exports['default'];

},{}],10:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
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

},{}],11:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Game = require('./Game');

var _Game2 = _interopRequireDefault(_Game);

var _visibility = require('./visibility');

function init() {
  var game = new _Game2['default'](document.getElementById('tutorial'));
  (0, _visibility.onVisibilityChange)(function (e) {
    if (document[_visibility.visProp]) {
      game.pause();
    } else {
      game.resume();
    }
  });
}

document.body.onload = init;

},{"./Game":3,"./visibility":12}],12:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.onVisibilityChange = onVisibilityChange;
var visProp = (function getHiddenProp() {
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
})();

var evtname;

function onVisibilityChange(change) {
  if (visProp) {
    evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange';
    document.addEventListener(evtname, change);
  }
}

exports.visProp = visProp;

},{}]},{},[11]);
