/* jshint bitwise: false */
import { PointLike } from './types'
import Obj from './Object'
import Geo from './Geo'
interface Reverse { [index: number]: PointLike}
export default class SpatialManager {
  SceneWidth: number
  SceneHeight: number
  cellsize: number
  cf: number
  cols: number
  rows: number
  numbuckets: number
  reverse: Reverse
  buckets: Map<number,Set<Obj>>
  constructor (scenewidth:number, sceneheight:number, cellsize:number) {
    this.SceneWidth = scenewidth
    this.SceneHeight = sceneheight
    this.cellsize = cellsize
    this.cf = 1 / cellsize

    this.cols = Math.ceil(scenewidth * this.cf)
    this.rows = Math.ceil(sceneheight * this.cf)
    this.buckets = new Map()
    this.numbuckets = this.rows * this.cols
    this.reverse = {}

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.reverse[x + y * this.cols | 0] = { x: x * cellsize, y: y * cellsize }
      }
    }

    this.clearBuckets()
  }

  clearBuckets () : void {
    this.buckets.clear()
    var i
    for (i = 0; i < this.numbuckets; i++) {
      this.buckets.set(i, new Set())
    }
  }

  registerObject (obj: Obj) : void {
    var cells = this.getIdForObject(obj.geo)
    var cell
    for (var i = 0; i < cells.length; i++) {
      cell = this.buckets.get(cells[i])
      /* istanbul ignore else */
      if (cell) {
        cell.add(obj)
      }
    }
  }

  getIdForObject (geo: Geo) : number[] {
    let bucketsObjIsIn:number[] = []
    var maxX = geo.pos.x + geo.aabb.max.x
    var maxY = geo.pos.y + geo.aabb.max.y
    var cf = this.cf
    var cols = this.cols

    // this.addBucket(geo.pos.x, geo.pos.y, cf, cols, bucketsObjIsIn)
    // this.addBucket(maxX, geo.pos.y, cf, cols, bucketsObjIsIn)
    // this.addBucket(geo.pos.x, maxY, cf, cols, bucketsObjIsIn)
    // this.addBucket(maxX, maxY, cf, cols, bucketsObjIsIn)
    const minX = (geo.pos.x / this.cellsize | 0) * this.cellsize
    const minY = (geo.pos.y / this.cellsize | 0) * this.cellsize
    for (let i = (maxX / this.cellsize | 0) * this.cellsize; i >= minX; i -= this.cellsize) {
      for (let j = (maxY / this.cellsize | 0) * this.cellsize; j >= minY; j -= this.cellsize) {
        // debugger
        this.addBucket(i, j, cf, cols, bucketsObjIsIn)
      }
    }

    return bucketsObjIsIn
  }

  idForPoint (x: number, y: number) : number {
    return (x * this.cf | 0) + (y * this.cf | 0) * this.cols | 0
  }

  addBucket (x: number, y: number, cf: number, cols: number, set: number[]) : void {
    // ignore collisions offscreen
    var id = (x * cf | 0) + (y * cf | 0) * cols | 0
    if (id >= 0 && id < this.numbuckets && set.indexOf(id) === -1) { // don't re-add the same item
      set.push(id)
    }
  }

  getNearby (geo: Geo) : Set<Obj> {
    var nearby = new Set()
    var ids = this.getIdForObject(geo)

    var i
    for (i = 0; i < ids.length; i++) {
      let bucketI = this.buckets.get(ids[i])
      let bucket
      /* istanbul ignore else */
      if (bucketI) {
        bucket = bucketI.values()
      }
      var b
      while (1) {
        /* istanbul ignore if */
        if (!bucket) {
          break
        }
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
