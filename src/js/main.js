'use strict';
/*jshint bitwise: false*/
// Code goes here
var hitboxes = [],
    ctx,
    fpsFilter = 10,
    Game = {
      debug: {
        on: true,
        fps: 0,
        text: 0,
        numUpdates: 0,
        itemL: 0,
        drawRate: 250
      },
      lastRender: window.performance.now(),
      tickLength: 16.25,
      ctrl: {
        cfg: {}
      }
    },
    Stage = {items: [], spatialManager: null, canvas: null, padding: 3},
    hatches = new Path2D();

Game.lastTick = Game.lastRender;
Game.debug.lastRender = Game.lastRender;
Game.Stage = Stage;

Game.debug.text = 0;

const a = 65,
  d = 68,
  w = 87,
  s = 83,
  space = 32,
  left = 37,
  right = 39,
  up = 38,
  down = 40,
  esc = 27;

Game.ctrl.cfg = {};
Game.ctrl.cfg[a] = Game.ctrl.cfg[left] = 'l';
Game.ctrl.cfg[d] = Game.ctrl.cfg[right] = 'r';
Game.ctrl.cfg[w] = Game.ctrl.cfg[up] = 'u';
Game.ctrl.cfg[s] = Game.ctrl.cfg[down] = 'd';
Game.ctrl.cfg[space] = 'f';
Game.ctrl.cfg[esc] = 'toggleFS';

// https://conkerjo.wordpress.com/2009/06/13/spatial-hashing-implementation-for-fast-2d-collisions/
import SpatialManager from './SpatialManager.js';
import Roid from './Roid.js';
import Craft from './Craft.js';
import {toggleFullScreen, fullScreenElementProp} from './fullScreen';

function kd (e) {
  Game.ctrl[Game.ctrl.cfg[e.keyCode]] = true;
}

function ku (e) {
  Game.ctrl[Game.ctrl.cfg[e.keyCode]] = false;
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
    Game.ctrl.l = (Game.craft.x + w2 - t.pageX) > 5;
    Game.ctrl.r = (Game.craft.x + w2 - t.pageX) < -5;
    Game.ctrl.u = (Game.craft.y + Game.craft.width + w2 - t.pageY) > 5;
    Game.ctrl.d = (Game.craft.y + Game.craft.width + w2 - t.pageY) < -5;
    Game.ctrl.f = true;
    e.preventDefault();
  }
}

function te (e) {
  Game.ctrl.l = false;
  Game.ctrl.r = false;
  Game.ctrl.u = false;
  Game.ctrl.d = false;
  Game.ctrl.f = false;
  if (document[fullScreenElementProp]) {
    e.preventDefault();
  }
}

function intersect (a, b) {
  return a.x > b.x && a.x < b.x + b.width && a.y > b.y && a.y < b.y + b.width;
}

function updateCanvasBoundaries () {
  if (document[fullScreenElementProp]) {
    Stage.canvas.width = window.screen.width;
    Stage.canvas.height = window.screen.height;
  } else {
    Stage.canvas.width = document.documentElement.clientWidth;
    Stage.canvas.height = document.documentElement.clientHeight;
  }
  Stage.xmax = Stage.canvas.width - Stage.padding;
  Stage.xmin = Stage.padding;
  Stage.ymin = Stage.padding;
  Stage.ymax = Stage.canvas.height - Stage.padding;

  hatches = new Path2D();
  let w = 109;
  let max = Stage.canvas.width / w;
  if (Stage.canvas.height /w > max) {
    max = Stage.canvas.height/w;
  }
  for (var i = 1; i < max; i++) {
    hatches.moveTo(i * w, 0);
    hatches.lineTo(i * w, Stage.canvas.height);
    hatches.moveTo(0, i*w);
    hatches.lineTo(Stage.canvas.width, i*w);
  }
  hatches.closePath();
  Game.debug.text++;
  Stage.spatialManager = new SpatialManager(Stage.canvas.width, Stage.canvas.height, 109);
  Stage.items.forEach(Stage.spatialManager.registerObject, Stage.spatialManager);
}

function draw (tFrame) {
  ctx.clearRect(0, 0, Stage.canvas.width, Stage.canvas.height);
  var fs = 70;
  Stage.items.forEach(function(i, idx, items) {
    i.draw(ctx);
  });

  if (Game.debug.on) {
    ctx.font = '64px roboto';
    ctx.fillText(Game.debug.fps.toFixed(1), 0, fs);
    ctx.fillText(Game.debug.itemL, 0, fs * 2);
    ctx.fillText(Game.debug.numUpdates, 0, fs * 3);
    ctx.fillText(Game.debug.text, Stage.canvas.width / 2, Stage.canvas.height /2);

    ctx.stroke(hatches);
    ctx.save();
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 3;
    hitboxes.forEach(function (xy) {
      ctx.strokeRect(xy.x, xy.y, 109, 109);
    });
    ctx.restore();
  }
}

function update (tickTime) {
  var cullQ = [];
  if (Math.random() > 0.9) {
    Stage.items.push(new Roid(Stage.canvas.width));
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
        if (Game.debug.on) {
          let ids = Stage.spatialManager.getIdForObject(o);
          for (let id of ids) {
            hitboxes.push(Stage.spatialManager.reverse[id]);
          }
        }
        if (intersect(i, o)) {
          if (o.boundToCanvas) {
            Game.debug.text = 'craftHit';
          }
          //only do from one side - let the foreach get the other
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
  var ud,
      timeSinceTick,
      thisFrameFPS,
      nextTick = Game.lastTick + Game.tickLength,
      numTicks = 0;

  Game.stopMain = window.requestAnimationFrame(main);

  if (Game.debug.on) {
    ud = tFrame - Game.debug.lastRender > Game.debug.drawRate;

    if (ud) {
      thisFrameFPS = 1000 / (tFrame - Game.lastRender);
      Game.debug.fps += (thisFrameFPS - Game.debug.fps) / fpsFilter;
      Game.debug.lastRender = tFrame;
      Game.debug.itemL = Stage.items.length;
    }
  }

  if (Game.ctrl.toggleFS) {
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
  if (Game.debug.on && ud) {
    Game.debug.numUpdates = numTicks;
  }

  draw(tFrame);
  Game.lastRender = tFrame;
}

function init () {
  Stage.canvas = document.getElementById('tutorial');

  Stage.canvas.onclick = function () {
    toggleFullScreen(Stage.canvas);
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
  Stage.spatialManager = new SpatialManager(Stage.canvas.width, Stage.canvas.height, 109);

  Game.craft = new Craft(Stage, Game.ctrl);
  Stage.spatialManager.registerObject(Game.craft);
  Stage.items.push(Game.craft);

  ctx = Stage.canvas.getContext('2d');

  window.requestAnimationFrame(main);

}
import {onVisibilityChange, visProp} from './visibility';
onVisibilityChange(function (e) {
  if (document[visProp]) {
    window.cancelAnimationFrame(Game.stopMain);
  } else {
    main(window.performance.now());
  }
});
document.body.onload = init;
