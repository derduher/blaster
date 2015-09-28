'use strict'
/*jshint bitwise: false*/

//import Projectile from './Projectile.js'
var debug = {
        on: true,
        fps: 50,
        text: 0,
        numUpdates: 0,
        itemL: 0,
        drawRate: 250
}

//const fpsFilter = 75

import SpatialManager from './SpatialManager.js'
import Roid from './Roid.js'
import Craft from './Craft.js'
import {toggleFullScreen, fullScreenElementProp} from './fullScreen'
import Controls from './Controls.js'

export default class Game {
  constructor (canvas) {
    this.hitboxes = new Set()
    this.debug = debug
    this.lastRender = window.performance.now()
    this.tickLength = 16.7
    this.ctrl = new Controls()
    this.lastTick = this.lastRender
    this.debug.lastRender = this.lastRender
    this.stage = {items: [], spatialManager: null, canvas: null, padding: 3}


    this.stage.canvas = canvas

    this.stage.canvas.onclick = () => toggleFullScreen(this.stage.canvas)
    window.onresize = () => this.updateCanvasBoundaries()
    this.updateCanvasBoundaries()
    document.onkeyup = this.ctrl.ku.bind(this.ctrl)
    document.onkeydown = this.ctrl.kd.bind(this.ctrl)
    document.ontouchstart = this.ctrl.ts.bind(this.ctrl)
    document.ontouchmove = this.ctrl.tm.bind(this.ctrl)
    document.ontouchend = this.ctrl.te.bind(this.ctrl)
    this.stage.spatialManager = new SpatialManager(this.stage.canvas.width, this.stage.canvas.height, 109)

    this.craft = new Craft(this.stage, this.ctrl)
    this.stage.spatialManager.registerObject(this.craft)
    this.stage.items.push(this.craft)

    this.ctx = this.stage.canvas.getContext('2d')

    window.requestAnimationFrame(this.main.bind(this))
  }
  main (tFrame) {
    var timeSinceTick,
    nextTick = this.lastTick + this.tickLength,
      numTicks = 0

    this.stopMain = window.requestAnimationFrame(this.main.bind(this))

    //if (this.debug.on) {
      //ud = tFrame - this.debug.lastRender > this.debug.drawRate

      //if (ud) {
        //thisFrameFPS = 1000 / (tFrame - this.lastRender)
        //this.debug.fps += (thisFrameFPS - this.debug.fps) / fpsFilter
        //this.debug.lastRender = tFrame
        //this.debug.itemL = this.stage.items.length
      //}
    //}

    if (this.ctrl.toggleFS) {
      toggleFullScreen()
    }

    //If tFrame < nextTick then 0 ticks need to be updated (0 is default for numTicks).
    //If tFrame = nextTick then 1 tick needs to be updated (and so forth).
    //Note: As we mention in summary, you should keep track of how large numTicks is.
    //If it is large, then either your game was asleep, or the machine cannot keep up.
    if (tFrame > nextTick) {
      timeSinceTick = tFrame - this.lastTick
      numTicks = (timeSinceTick / this.tickLength) | 0
      //if (numTicks !== 1) {
        //console.log(numTicks)
      //}
      if (numTicks > 4) {
        numTicks = 4
      }
    }
    this.updates(numTicks)
    //if (this.debug.on && ud) {
      //this.debug.numUpdates = numTicks
    //}

    this.draw(tFrame)
    this.lastRender = tFrame
  }
  updateCanvasBoundaries () {
    if (document[fullScreenElementProp]) {
      this.stage.canvas.width = window.screen.width
      this.stage.canvas.height = window.screen.height
    } else {
      this.stage.canvas.width = document.documentElement.clientWidth
      this.stage.canvas.height = document.documentElement.clientHeight
    }
    this.stage.xmax = this.stage.canvas.width - this.stage.padding
    this.stage.xmin = this.stage.padding
    this.stage.ymin = this.stage.padding
    this.stage.ymax = this.stage.canvas.height - this.stage.padding

    this.hatches = new Path2D()
    let w = 109
    let max = this.stage.canvas.width / w
    if (this.stage.canvas.height /w > max) {
      max = this.stage.canvas.height/w
    }
    this.debug.text++
    //this.stage.items = []
    //for (var i=0; i<8; i++) {
      //for (var j=0;j < 5; j++) {
        //this.stage.items.push(new Roid(this.stage.canvas.width, i*90, j*90))
      //}
    //}
    this.stage.spatialManager = new SpatialManager(this.stage.canvas.width, this.stage.canvas.height, 109)
    this.stage.items.forEach(this.stage.spatialManager.registerObject, this.stage.spatialManager)
  }
  updates (numTicks) {
    var i
    for (i=0; i < numTicks; i++) {
      this.lastTick += this.tickLength
      this.update(this.lastTick)
    }
  }
  draw (tFrame) {
    this.ctx.clearRect(0, 0, this.stage.canvas.width, this.stage.canvas.height)
    //var fs = 70
    for (var i = 0; i < this.stage.items.length; i++) {
      this.stage.items[i].draw(this.ctx)
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
      this.hitboxes.forEach( xy => this.ctx.strokeRect(xy.x, xy.y, 109, 109))
      this.ctx.restore()
    }
    */
  }
  boundNTick (i, tickTime) {
    i.tick(tickTime)
    var x = i.geo.pos.x + i.geo.v.x,
      y = i.geo.pos.y + i.geo.v.y,
      cull = false

    if (((i.geo.v.x <= 0 || x < this.stage.xmax - i.width) && (i.geo.v.x >= 0 || x > this.stage.xmin)) ||
        !i.boundToCanvas && x < this.stage.xmax && x > -100
       ) {
         i.geo.pos.x = x
       } else if (!i.boundToCanvas) {
         cull = true
       }
       if (((i.geo.v.y <= 0 || y < this.stage.ymax - i.width) && (i.geo.v.y >= 0 || y > this.stage.ymin)) ||
           !i.boundToCanvas && y < this.stage.ymax && y > -100) {
         i.geo.pos.y = y
       } else if (!i.boundToCanvas) {
         cull = true
       }
       if (!cull) {
         this.stage.spatialManager.registerObject(i)
       }
       return cull
  }
  testIntersect (item, i, o, cullQ) {
    if (item.geo.intersectsWith(o.geo)) {
      item.health -= 200
      if (item.health < 9) {
        cullQ.push(i)
      }
    }
  }
  update (tickTime) {
    var cullQ = []
    if (Math.random() > 0.99) {
      this.stage.items.push(new Roid(this.stage.canvas.width))
    }
    this.stage.spatialManager.clearBuckets()
    for (let i = 0; i < this.stage.items.length; i++) {
      if (this.boundNTick(this.stage.items[i], tickTime)) {
        cullQ.push(i)
      }
    }

    this.hitboxes = new Set()
    var i, item
    for (i=0; i < this.stage.items.length; i++) {
      item = this.stage.items[i]
      let nearby = this.stage.spatialManager.getNearby(item.x|0, item.y|0, item.width|0).values()
      while (1) {
        let o = nearby.next()
        if (o.done) {
          break
        }
        this.testIntersect(item, i, o.value, cullQ)
      }
    }

    var culled = 0
    cullQ.sort(function (a, b) {
      if (a < b) {
        return -1
      }
      return a > b ? 1 : 0
    })
    cullQ.forEach( v => this.stage.items.splice(v - culled++, 1))
  }
  pause () {
    window.cancelAnimationFrame(this.stopMain)
  }
  resume () {
    this.main(window.performance.now())
  }
}
