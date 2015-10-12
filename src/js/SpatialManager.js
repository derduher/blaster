'use strict'
/* jshint bitwise: false*/
export default class SpatialManager {
  constructor (scenewidth, sceneheight, cellsize) {
    this.SceneWidth = scenewidth
    this.SceneHeight = sceneheight
    this.cf = 1 / cellsize

    this.cols = Math.ceil(scenewidth * this.cf)
    this.rows = Math.ceil(sceneheight * this.cf)
    this.buckets = new Map()
    this.numbuckets = this.rows * this.cols
    this.reverse = {}

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.reverse[x + y * this.cols | 0] = {x: x * cellsize, y: y * cellsize}
      }
    }

    this.clearBuckets()
  }
  clearBuckets () {
    this.buckets.clear()
    var i
    for (i = 0; i < this.numbuckets; i++) {
      this.buckets.set(i, new Set())
    }
  }
  registerObject (obj) {
    var cells = this.getIdForObject(obj.x | 0, obj.y | 0, obj.width | 0)
    var cell
    for (var i = 0; i < cells.length; i++) {
      cell = this.buckets.get(cells[i])
      if (cell) {
        cell.add(obj)
      }
    }
  }
  getIdForObject (x, y, width) {
    var bucketsObjIsIn = []
    var maxX = x + width
    var maxY = y + width
    var cf = this.cf
    var cols = this.cols

    // TopLeft
    this.addBucket(x, y, cf, cols, bucketsObjIsIn)
    // TopRight
    this.addBucket(maxX, y, cf, cols, bucketsObjIsIn)
    // BottomRight
    this.addBucket(maxX, maxY, cf, cols, bucketsObjIsIn)
    // BottomLeft
    this.addBucket(x, maxY, cf, cols, bucketsObjIsIn)

    return bucketsObjIsIn
  }
  addBucket (x, y, cf, cols, set) {
    // ignore collisions offscreen
    var id = (x * cf | 0) + (y * cf | 0) * cols | 0
    if (id >= 0 && id < this.numbuckets && set.indexOf(id) === -1) {
      set.push(id)
    }
  }
  getNearby (x, y, width) {
    var nearby = new Set()
    var ids = this.getIdForObject(x, y, width)

    var i
    for (i = 0; i < ids.length; i++) {
      let bucket = this.buckets.get(ids[i]).values()
      var b
      while (1) {
        b = bucket.next()
        if (b.done) {
          break
        }
        nearby.add(b.value)
      }
    }
    return nearby
  }
}
