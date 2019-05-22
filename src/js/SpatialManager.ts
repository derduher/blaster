/* jshint bitwise: false */
import { PointLike } from './types'
import Obj from './Object'
import Geo from './Geo'
import Point2 from './Point2'
interface Reverse { [index: number]: PointLike}
export default class SpatialManager {
  cf: number
  cols: number
  rows: number
  numbuckets: number
  reverse: Reverse
  buckets: Map<number,Set<Obj>>
  constructor (public SceneWidth:number, public SceneHeight:number, public cellsize:number) {
    this.cf = 1 / cellsize

    this.cols = Math.ceil(SceneWidth * this.cf)
    this.rows = Math.ceil(SceneHeight * this.cf)
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
    for (let i = 0; i < this.numbuckets; i++) {
      this.buckets.set(i, new Set())
    }
  }

  registerObject (obj: Obj) : void {
    for (let id of this.getIdForObject(obj.geo)) {
      let cell = this.buckets.get(id)
      /* istanbul ignore else */
      if (cell) {
        cell.add(obj)
      }
    }
  }

  getIdForObject (geo: Geo) : Set<number> {
    const bucketsObjIsIn:Set<number> = new Set()
    const maxX = geo.pos.x + geo.aabb.max.x
    const maxY = geo.pos.y + geo.aabb.max.y
    const cf = this.cf
    const cols = this.cols

    // this.addBucket(geo.pos.x, geo.pos.y, cf, cols, bucketsObjIsIn)
    // this.addBucket(maxX, geo.pos.y, cf, cols, bucketsObjIsIn)
    // this.addBucket(geo.pos.x, maxY, cf, cols, bucketsObjIsIn)
    // this.addBucket(maxX, maxY, cf, cols, bucketsObjIsIn)
    const minX = (geo.pos.x / this.cellsize | 0) * this.cellsize
    const minY = (geo.pos.y / this.cellsize | 0) * this.cellsize
    for (let i = (maxX / this.cellsize | 0) * this.cellsize; i >= minX; i -= this.cellsize) {
      for (let j = (maxY / this.cellsize | 0) * this.cellsize; j >= minY; j -= this.cellsize) {
        // debugger
        SpatialManager.addBucket(i, j, cf, cols, bucketsObjIsIn, this.numbuckets)
      }
    }

    return bucketsObjIsIn
  }

  static idForPoint (point: Point2, cf: number, cols: number) {
    return (point.x * cf | 0) + (point.y * cf | 0) * cols | 0
  }

  idForPoint (point: Point2) : number {
    return SpatialManager.idForPoint(point, this.cf, this.cols)
  }

  static addBucket (x: number, y: number, cf: number, cols: number, set: Set<number>, numbuckets: number) : void {
    // ignore collisions offscreen
    const id = SpatialManager.idForPoint(new Point2(x, y), cf, cols)
    if (id >= 0 && id < numbuckets) {
      set.add(id)
    }
  }

  getNearby (geo: Geo) : Set<Obj> {
    const nearby = new Set()
    const ids = this.getIdForObject(geo)

    for (let id of ids) {
      let bucketI = this.buckets.get(id)
      /* istanbul ignore else */
      if (bucketI) {
        const bucket = bucketI.values()
        for (let b of bucket) {
          nearby.add(b)
        }
      }
    }
    return nearby
  }
}
