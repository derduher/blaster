(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fullScreen = require('./fullScreen');

var a = 65,
    d = 68,
    w = 87,
    s = 83,
    space = 32,
    left = 37,
    right = 39,
    up = 38,
    down = 40,
    esc = 27;

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

},{"./fullScreen":7}],2:[function(require,module,exports){
'use strict';
/*jshint bitwise: false*/
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = Craft;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ProjectileJs = require('./Projectile.js');

var _ProjectileJs2 = _interopRequireDefault(_ProjectileJs);

var pSpeed = 50;

var speed = 5;
var posDir = speed;
var negDir = speed * -1;

function Craft(stage, ctrl) {
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

Craft.prototype.draw = function draw(ctx) {
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.stroke(this.path);
  ctx.restore();
};

Craft.prototype.tick = function tick(now) {
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
    var p = new _ProjectileJs2['default'](this);
    this.stage.items.push(p);
    this.stage.spatialManager.registerObject(p);
    this.lastFire = now;
  }
};
module.exports = exports['default'];

},{"./Projectile.js":4}],3:[function(require,module,exports){
'use strict';
/*jshint bitwise: false*/

//import Projectile from './Projectile.js';
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

//const fpsFilter = 75;

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
    this.tickLength = 16.25;
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
      var timeSinceTick,
          nextTick = this.lastTick + this.tickLength,
          numTicks = 0;

      this.stopMain = window.requestAnimationFrame(this.main.bind(this));

      //if (this.debug.on) {
      //ud = tFrame - this.debug.lastRender > this.debug.drawRate;

      //if (ud) {
      //thisFrameFPS = 1000 / (tFrame - this.lastRender);
      //this.debug.fps += (thisFrameFPS - this.debug.fps) / fpsFilter;
      //this.debug.lastRender = tFrame;
      //this.debug.itemL = this.stage.items.length;
      //}
      //}

      if (this.ctrl.toggleFS) {
        (0, _fullScreen.toggleFullScreen)();
      }

      //If tFrame < nextTick then 0 ticks need to be updated (0 is default for numTicks).
      //If tFrame = nextTick then 1 tick needs to be updated (and so forth).
      //Note: As we mention in summary, you should keep track of how large numTicks is.
      //If it is large, then either your game was asleep, or the machine cannot keep up.
      if (tFrame > nextTick) {
        timeSinceTick = tFrame - this.lastTick;
        numTicks = timeSinceTick / this.tickLength | 0;
        if (numTicks > 30) {
          numTicks = 30;
        }
      }
      this.updates(numTicks);
      //if (this.debug.on && ud) {
      //this.debug.numUpdates = numTicks;
      //}

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
      //this.stage.items = [];
      //for (var i=0; i<8; i++) {
      //for (var j=0;j < 5; j++) {
      //this.stage.items.push(new Roid(this.stage.canvas.width, i*90, j*90));
      //}
      //}
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
      //var fs = 70;
      for (var i = 0; i < this.stage.items.length; i++) {
        this.stage.items[i].draw(this.ctx);
      }

      /*
      if (this.debug.on) {
        this.ctx.font = '64px roboto';
        this.ctx.fillText(this.debug.fps.toFixed(1), 0, fs);
        this.ctx.fillText(this.debug.itemL, 0, fs * 2);
        this.ctx.fillText(this.debug.numUpdates, 0, fs * 3);
        this.ctx.fillText(this.debug.text, this.stage.canvas.width / 2, this.stage.canvas.height /2);
         this.ctx.stroke(this.hatches);
        this.ctx.save();
        this.ctx.strokeStyle = 'green';
        this.ctx.lineWidth = 3;
        this.hitboxes.forEach( xy => this.ctx.strokeRect(xy.x, xy.y, 109, 109));
        this.ctx.restore();
      }
      */
    }
  }, {
    key: 'boundNTick',
    value: function boundNTick(i, tickTime) {
      i.tick(tickTime);
      var x = i.x + i.vx,
          y = i.y + i.vy,
          cull = false;

      if ((i.vx <= 0 || x < this.stage.xmax - i.width) && (i.vx >= 0 || x > this.stage.xmin) || !i.boundToCanvas && x < this.stage.xmax && x > -100) {
        i.x = x;
      } else if (!i.boundToCanvas) {
        cull = true;
      }
      if ((i.vy <= 0 || y < this.stage.ymax - i.width) && (i.vy >= 0 || y > this.stage.ymin) || !i.boundToCanvas && y < this.stage.ymax && y > -100) {
        i.y = y;
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
      if (this.intersect(item, o)) {
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
      if (Math.random() > 0.9) {
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
    key: 'intersect',
    value: function intersect(a, b) {
      //foo
      return (a.x < b.x && a.x + a.width > b.x || b.x < a.x && b.x + b.width > a.x) && (a.y < b.y && a.y + a.width > b.y || b.y < a.y && b.y + b.width > a.y);
      //return a.x > b.x && a.x < b.x + b.width && a.y > b.y && a.y < b.y + b.width;
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

},{"./Controls.js":1,"./Craft.js":2,"./Roid.js":5,"./SpatialManager.js":6,"./fullScreen":7}],4:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = Projectile;

function Projectile(craft) {
  this.x = craft.x + craft.width / 2;
  this.width = 3;
  this.health = 150;
  this.vx = craft.vx;
  this.vy = -10 + craft.vy;
  this.y = craft.y + this.vy;
  this.boundToCanvas = false;
}

Projectile.prototype.tick = function tick() {
  this.vx *= 0.996;
  this.vy *= 0.996;
};

Projectile.prototype.draw = function draw(ctx) {
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.fillRect(0, 0, this.width, this.width);
  ctx.restore();
};
module.exports = exports['default'];

},{}],5:[function(require,module,exports){
'use strict';
/*jshint bitwise: false*/
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = Roid;

function Roid(cw) {
  this.width = 9 + 100 * Math.random() | 0;
  this.health = this.initialHealth = (0.5 + Math.random()) * this.width * this.width | 0;
  this.x = cw * Math.random();
  this.y = 0 - this.width;
  this.vx = 0.2 * (-0.5 + Math.random());
  this.vy = 1 * Math.random();
  this.color = 'black';
  this.path = new Path2D();
  this.path.arc(this.width / 2, this.width / 2, this.width / 2, 0, Math.PI * 2);
}

Roid.prototype.tick = function tick() {};

Roid.prototype.draw = function draw(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgb(' + (148 + 107 * (1 - this.health / this.initialHealth) | 0) + ',0,234)';
  //ctx.fillStyle = this.color;
  ctx.translate(this.x, this.y);
  ctx.fill(this.path);
  ctx.restore();
};
module.exports = exports['default'];

},{}],6:[function(require,module,exports){
'use strict';
/*jshint bitwise: false*/
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
      var maxX = x + width,
          maxY = y + width,
          cf = this.cf,
          cols = this.cols;

      //TopLeft
      this.addBucket(x, y, cf, cols, bucketsObjIsIn);
      //TopRight
      this.addBucket(maxX, y, cf, cols, bucketsObjIsIn);
      //BottomRight
      this.addBucket(maxX, maxY, cf, cols, bucketsObjIsIn);
      //BottomLeft
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"./Game":3,"./visibility":9}],9:[function(require,module,exports){
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

},{}]},{},[8]);
