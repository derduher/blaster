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
      const foo = new Obj(new Point2(), stage)
      spatial.registerObject(foo)
      expect(spatial.buckets.get(0).has(foo)).toBeTruthy()
      spatial.clearBuckets()
      expect(spatial.buckets.get(0).has(foo)).toBeFalsy()
    })
  })
  
  describe('registerObject', () => {
    it('adds the passed in obj to its matching buckets', () => {
      spyOn(spatial, 'getIdForObject').and.returnValue([0, 1])
      const foo = new Obj(new Point2(), stage)
      spatial.registerObject(foo)
      expect(spatial.buckets.get(0).has(foo)).toBeTruthy()
      expect(spatial.buckets.get(1).has(foo)).toBeTruthy()
    })
  })

  describe('getIdForObject', () => {
    it('returns an array of ids', () => {
      const geo = new Geo()
      geo.points.push(new Point2(0, 0))
      geo.points.push(new Point2(0, 11))
      geo.points.push(new Point2(11, 11))
      geo.pos.x = 0
      geo.pos.y = 0
      geo.aabb.max.x = 11
      geo.aabb.max.y = 11
      expect(spatial.getIdForObject(geo)[0]).toBe(101)
      expect(spatial.getIdForObject(geo)[1]).toBe(1)
      expect(spatial.getIdForObject(geo)[2]).toBe(100)
      expect(spatial.getIdForObject(geo)[3]).toBe(0)
      expect(spatial.getIdForObject(geo).length).toBe(4)
    })
  })

  describe('idForPoint', () => {
    it('translates the given coordinates into an id', () => {
    // return (x * this.cf | 0) + (y * this.cf | 0) * this.cols | 0
      expect(spatial.idForPoint(100, 50)).toBe(510)
      expect(spatial.idForPoint(0, 0)).toBe(0)
      expect(spatial.idForPoint(11, 0)).toBe(1)
    })
  })

  describe('addBucket', () => {
    it('translates the provided coordinates into an id and adds to the bucket', () => {
      let bucket: number[] = []
      spatial.addBucket(0, 0, 0.1, 10, bucket)
      expect(bucket[0]).toBe(0)
    })
  })

  describe('getNearby', () => {
    it('returns a set of object near the passed in obj', () => {
      spyOn(spatial, 'getIdForObject').and.returnValue([0, 1])
      const foo = new Obj(new Point2(), stage)
      const bar = new Obj(new Point2(), stage)
      const baz = new Obj(new Point2(), stage)
      spatial.registerObject(foo)
      spatial.registerObject(bar)
      const nearby = spatial.getNearby(baz.geo)
      expect(nearby.has(foo)).toBeTruthy()
      expect(nearby.has(bar)).toBeTruthy()
      expect(nearby.has(baz)).toBeFalsy()
    })
  })
})
