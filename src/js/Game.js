var debug = {
  on: false,
  fps: 50,
  text: '',
  numUpdates: 0,
  itemL: 0,
  drawRate: 250
}

const fpsFilter = 75

import Stage from './Stage.js'
import SpatialManager from './SpatialManager.js'
import Roid from './Roid.js'
import Craft from './Craft.js'
// import NPC from './NPC.js'
// import Point2 from './Point2.js'
import { toggleFullScreen, fullScreenElementProp } from './fullScreen'
import Controls from './Controls.js'
import roidPosFactory from './roidPosFactory.js'

export default class Game {
  constructor (canvas) {
    this.hitboxes = new Set()
    this.debug = debug
    this.lastRender = window.performance.now()
    this.tickLength = 16.7
    this.ctrl = new Controls()
    this.lastTick = this.lastRender
    this.debug.lastRender = this.lastRender
    this.stage = new Stage(canvas)
    this.started = false

    this.isTouchInterface = 'ontouchend' in document.documentElement

    this.stage.canvas.onclick = () => {
      if (this.isTouchInterface || this.started) {
        toggleFullScreen(this.stage.canvas)
      }
      if (!this.started) {
        this.resume()
      }
    }
    document.addEventListener('keyup', this.pausedOnKeyUp.bind(this))
    document.addEventListener('keyup', this.ctrl.ku.bind(this.ctrl))
    document.onkeydown = this.ctrl.kd.bind(this.ctrl)
    document.ontouchstart = this.ctrl.ts.bind(this.ctrl)
    document.ontouchmove = this.ctrl.tm.bind(this.ctrl)
    document.addEventListener('touchend', this.ctrl.te.bind(this.ctrl))
    document.addEventListener('touchend', this.pausedOnTap.bind(this))
    window.onresize = () => this.updateCanvasBoundaries()

    this.stage.spatialManager = new SpatialManager(document.documentElement.clientWidth, document.documentElement.clientHeight, 109)

    this.craft = new Craft(this.stage, this.ctrl)
    this.stage.spatialManager.registerObject(this.craft)
    this.stage.items.push(this.craft)
    this.stage.craft = this.craft

    this.ctx = this.stage.canvas.getContext('2d')
    this.updateCanvasBoundaries()
    this.ctx.fillStyle = 'rgb(255,255,255)'
    this.showInstructions()

    // this.npc = new NPC(new Point2(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 4), this.stage)
    // this.stage.spatialManager.registerObject(this.npc)
    // this.stage.items.push(this.npc)

    // let roid = new Roid(roidPosFactory(this.stage.canvas.width, this.stage.canvas.height), this.stage)
    // window.roid = roid
    // this.stage.items.push(roid)
    // this.stage.spatialManager.registerObject(roid)

    // let p = new Projectile({geo: {
      // pos: {x: (this.stage.canvas.width / 2) + roid.width / 2, y: (this.stage.canvas.height / 2) + roid.width / 2},
      // v: {x: 0, y: 0}
    // },
      // width: 20
    // }, {x: 0, y: 0})
    // window.p = p
    // this.stage.items.push(p)
    // this.stage.spatialManager.registerObject(p)
  }

  main (tFrame) {
    this.started = true
    var timeSinceTick
    var nextTick = this.lastTick + this.tickLength
    var numTicks = 0
    var ud = 0
    var thisFrameFPS = 60.1

    this.stopMain = window.requestAnimationFrame(this.main.bind(this))

    if (this.debug.on) {
      ud = tFrame - this.debug.lastRender > this.debug.drawRate

      if (ud) {
        thisFrameFPS = 1000 / (tFrame - this.lastRender)
        this.debug.fps += (thisFrameFPS - this.debug.fps) / fpsFilter
        this.debug.lastRender = tFrame
        this.debug.itemL = this.stage.items.length
      }
    }

    if (this.ctrl.toggleFS) {
      this.pause()
      toggleFullScreen()
    }

    // If tFrame < nextTick then 0 ticks need to be updated (0 is default for numTicks).
    // If tFrame = nextTick then 1 tick needs to be updated (and so forth).
    // Note: As we mention in summary, you should keep track of how large numTicks is.
    // If it is large, then either your game was asleep, or the machine cannot keep up.
    if (tFrame > nextTick) {
      timeSinceTick = tFrame - this.lastTick
      numTicks = (timeSinceTick / this.tickLength) | 0
      // if (numTicks !== 1) {
      // console.log(numTicks)
      // }
      if (numTicks > 4) {
        numTicks = 4
      }
    }

    this.updates(numTicks)

    if (this.debug.on && ud) {
      this.debug.numUpdates = numTicks
    }

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
    if (this.stage.canvas.height / w > max) {
      max = this.stage.canvas.height / w
    }
    // this.debug.text++
    // this.stage.items = []
    // for (var i=0; i<8; i++) {
    // for (var j=0;j < 5; j++) {
    // this.stage.items.push(new Roid(this.stage.canvas.width, i*90, j*90))
    // }
    // }
    this.stage.spatialManager = new SpatialManager(this.stage.canvas.width, this.stage.canvas.height, 109)
    this.stage.items.forEach(this.stage.spatialManager.registerObject, this.stage.spatialManager)
    if (this.started && !this.stopMain) {
      this.draw()
      this.showPause()
    }
  }

  updates (numTicks) {
    var i
    for (i = 0; i < numTicks; i++) {
      this.lastTick += this.tickLength
      this.update(this.lastTick)
    }
  }

  drawBuckets () {
    let numPixels = this.stage.canvas.width * this.stage.canvas.height
    for (let i = 0; i < numPixels; i++) {
      let x = i % this.stage.canvas.width
      let y = (i / this.stage.canvas.width) | 0
      let pct = 100 * this.stage.spatialManager.idForPoint(x, y) / this.stage.spatialManager.numbuckets
      this.ctx.fillStyle = `hsl(270, 10%, ${pct}%)`
      this.ctx.fillRect(x, y, 1, 1)
    }
  }

  draw (tFrame) {
    if (!window.hold) {
      this.ctx.clearRect(0, 0, this.stage.canvas.width, this.stage.canvas.height)
    }
    this.ctx.strokeStyle = 'rgb(255,255,255)'
    this.ctx.fillStyle = 'rgb(255,255,255)'
    this.ctx.save()
    var fs = 70
    for (var i = 0; i < this.stage.items.length; i++) {
      this.stage.items[i].draw(this.ctx, this.debug.on)
    }

    if (this.debug.on) {
      this.ctx.font = '64px roboto'
      this.ctx.fillText(this.debug.fps.toFixed(1), 0, fs)
      this.ctx.fillText(this.debug.itemL, 0, fs * 2)
      this.ctx.fillText(this.debug.numUpdates, 0, fs * 3)
      this.ctx.fillText(this.debug.text, this.stage.canvas.width / 2, this.stage.canvas.height / 2)

      this.ctx.stroke(this.hatches)
      this.ctx.save()
      this.ctx.strokeStyle = 'green'
      this.ctx.lineWidth = 3
      this.hitboxes.forEach(xy => this.ctx.strokeRect(xy.x, xy.y, 109, 109))
      this.ctx.restore()
    }
  }

  boundNTick (i, tickTime) {
    i.tick(tickTime)
    var x = i.geo.pos.x + i.geo.v.x
    var y = i.geo.pos.y + i.geo.v.y
    var cull = false

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

  // o other object
  testIntersect (item, i, o, cullQ) {
    if (item.geo.intersectsWith(o.geo)) {
      item.intersects(o, i, cullQ)
    }
  }

  update (tickTime) {
    var cullQ = []
    if (Math.random() > 0.99) {
      this.stage.items.push(new Roid(roidPosFactory(this.stage.canvas.width, this.stage.canvas.height), this.stage))
    }

    this.stage.spatialManager.clearBuckets()
    for (let i = 0; i < this.stage.items.length; i++) {
      if (this.boundNTick(this.stage.items[i], tickTime)) {
        cullQ.push(i)
      }
    }

    this.hitboxes = new Set()
    var i

    /**
     * for every item on stage, look for items nearby and test whether they intersect
     */
    for (i = 0; i < this.stage.items.length; i++) {
      // for (let j = 0; j < this.stage.items.length; j++) {
        // if (i !== j) {
          // this.testIntersect(this.stage.items[i], i, this.stage.items[j], cullQ)
        // }
      // }
      let nearby = this.stage.spatialManager.getNearby(this.stage.items[i].geo).values()
      while (1) {
        let o = nearby.next()
        if (o.done) {
          break
        }
        this.testIntersect(this.stage.items[i], i, o.value, cullQ)
      }
    }

    var culled = 0
    cullQ.sort(function (a, b) {
      if (a < b) {
        return -1
      }
      return a > b ? 1 : 0
    })
    cullQ.forEach(v => this.stage.items.splice(v - culled++, 1))
  }

  messageModal (msg) {
    let x = this.stage.canvas.width / 2
    let y = this.stage.canvas.height / 2
    this.ctx.textAlign = 'center'
    this.ctx.save()
    this.ctx.font = '64px roboto'
    this.ctx.fillText(msg[0], x, y)
    this.ctx.restore()
    if (msg.length > 1) {
      this.ctx.save()
      this.ctx.font = '48px roboto'
      this.ctx.fillText(msg[1], x, y + 72)
      this.ctx.restore()
    }
  }

  showInstructions () {
    let msg = []
    if (this.isTouchInterface) {
      msg[0] = 'Tap to start'
    } else {
      msg[0] = 'Click to start'
    }

    if (this.isTouchInterface) {
      msg[1] = 'drag to move the craft'
    } else {
      msg[1] = 'use wasd/arrow keys to move, spacebar to fire'
    }

    this.messageModal(msg)
  }

  showPause () {
    let msg = []

    if (this.isTouchInterface) {
      msg[0] = 'Tap to resume'
    } else {
      msg[0] = 'Press space to resume'
    }

    this.messageModal(msg)
  }

  pausedOnKeyUp (e) {
    if (!this.stopMain && e.keyCode === 32) {
      this.resume()
    }
  }

  pausedOnTap (e) {
    if (!this.stopMain) {
      this.resume()
    }
  }
  _pause () {
    window.cancelAnimationFrame(this.stopMain)
    this.stopMain = null
  }

  pause () {
    this._pause()
    this.showPause()
  }

  resume () {
    // prevents the engine from trying to catch up from all the lost cycles
    // before pause
    this.lastTick = window.performance.now()
    this.main(this.lastTick)
  }
}
