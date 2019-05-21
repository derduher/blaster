import Geo from './Geo'
import Obj from './Object'
import Point2 from './Point2'
import Stage from './Stage'
import SpatialManager from './SpatialManager'

describe('SpatialManager', () => {
  let spatial:SpatialManager
  let stage:Stage
  beforeEach(() => {
    spatial = new SpatialManager(1000, 1000, 10)
    stage = new Stage(document.createElement('canvas'), spatial)
  })

  describe('clearBuckets', () => {
    it('empties all buckets', () => {
      spyOn(spatial, 'getIdForObject').and.returnValue([0, 1])
      const foo = new Obj(new Point2(), stage, [new Point2])
      spatial.registerObject(foo)
      expect(spatial.buckets.get(0).has(foo)).toBeTruthy()
      spatial.clearBuckets()
      expect(spatial.buckets.get(0).has(foo)).toBeFalsy()
    })
  })
  
  describe('registerObject', () => {
    it('adds the passed in obj to its matching buckets', () => {
      spyOn(spatial, 'getIdForObject').and.returnValue([0, 1])
      const foo = new Obj(new Point2(), stage, [new Point2])
      spatial.registerObject(foo)
      expect(spatial.buckets.get(0).has(foo)).toBeTruthy()
      expect(spatial.buckets.get(1).has(foo)).toBeTruthy()
    })
  })

  describe('getIdForObject', () => {
    it('returns an array of ids', () => {
      const geo = new Geo([new Point2(0, 0), new Point2(0, 11), new Point2(11, 11)])
      expect(spatial.getIdForObject(geo).has(101)).toBe(true)
      expect(spatial.getIdForObject(geo).has(1)).toBe(true)
      expect(spatial.getIdForObject(geo).has(100)).toBe(true)
      expect(spatial.getIdForObject(geo).has(0)).toBe(true)
      expect(spatial.getIdForObject(geo).size).toBe(4)
    })
  })

  describe('idForPoint', () => {
    it('translates the given coordinates into an id', () => {
    // return (x * this.cf | 0) + (y * this.cf | 0) * this.cols | 0
      expect(spatial.idForPoint(new Point2(100, 50))).toBe(510)
      expect(spatial.idForPoint(new Point2(0, 0))).toBe(0)
      expect(spatial.idForPoint(new Point2(11, 0))).toBe(1)
    })
  })

  describe('addBucket', () => {
    it('translates the provided coordinates into an id and adds to the bucket', () => {
      let bucket: Set<number> = new Set()
      SpatialManager.addBucket(0, 0, 0.1, 10, bucket, 1000)
      expect(bucket.has(0)).toBe(true)
    })
  })

  describe('getNearby', () => {
    it('returns a set of object near the passed in obj', () => {
      spyOn(spatial, 'getIdForObject').and.returnValue([0, 1])
      const foo = new Obj(new Point2(), stage, [new Point2])
      const bar = new Obj(new Point2(), stage, [new Point2])
      const baz = new Obj(new Point2(), stage, [new Point2])
      spatial.registerObject(foo)
      spatial.registerObject(bar)
      const nearby = spatial.getNearby(baz.geo)
      expect(nearby.has(foo)).toBeTruthy()
      expect(nearby.has(bar)).toBeTruthy()
      expect(nearby.has(baz)).toBeFalsy()
    })
  })
})
