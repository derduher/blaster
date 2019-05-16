import Geo from './Geo'
import Point2 from './Point2'
import Obj from './Object'
import Stage from './Stage'
import { BoundingBox } from './types'
describe('Geo', () => {
  let geo:Geo
  let tri1:Point2[]
  let tri2:Point2[]
  let tri3:Point2[]
  let aabb1:BoundingBox
  let aabb2:BoundingBox
  let aabb3:BoundingBox
  beforeEach(() => {
    geo = new Geo()
    tri1 = [new Point2(), new Point2(0, 10), new Point2(10, 10)]
    tri2 = [new Point2(3, 3), new Point2(20, 3), new Point2(3, 20)]
    tri3 = [new Point2(40, 40), new Point2(40, 50), new Point2(50, 50)]
    aabb1 = {min: tri1[0], max: tri1[2]}
    aabb2 = {min: tri2[0], max: new Point2(20, 20)}
    aabb3 = {min: tri3[0], max: tri3[2]}
  })

  describe('distanceTo', () => {
    // note geometry position is not in the center of geometry
    it('returns the distance from the geometry position to the passed in point', () => {
      expect(geo.distanceTo(new Point2())).toBe(0)
      expect(geo.distanceTo(new Point2(3, 4))).toBe(5)
    })
  })

  describe('distanceToObj', () => {
    it('unwraps passed in obj to its position', () => {
      const stage = new Stage(document.createElement('canvas'))
      const obj = new Obj(new Point2, stage)
      spyOn(geo, 'distanceTo')
      geo.distanceToObj(obj)
      expect(geo.distanceTo).toHaveBeenCalledWith(obj.geo.pos)
    })
  })

  describe('aabbIntersects', () => {
    it('returns true if two geometries intersect', () => {
      const otherGeo = new Geo()
      otherGeo.aabb = aabb2
      geo.aabb = aabb1
      expect(geo.aabbIntersects(otherGeo)).toBe(true)
      expect(otherGeo.aabbIntersects(geo)).toBe(true)
    })

    it('returns false if two geometries do not intersect', () => {
      const otherGeo = new Geo()
      otherGeo.aabb = aabb3
      geo.aabb = aabb1
      expect(geo.aabbIntersects(otherGeo)).toBe(false)
      expect(otherGeo.aabbIntersects(geo)).toBe(false)
    })
  })

  describe('crossProduct', () => {
    it('calculates correctly', () => {
      expect(geo.crossProduct(new Point2(), new Point2())).toBe(0)
      expect(geo.crossProduct(new Point2(1, 1), new Point2(1, 1))).toBe(0)
      expect(geo.crossProduct(new Point2(10, 10), new Point2(10, 10))).toBe(0)
      expect(geo.crossProduct(new Point2(10, 10), new Point2(1, 1))).toBe(0)
      expect(geo.crossProduct(new Point2(10, 4), new Point2(1, 1))).toBe(6)
    })
  })

  describe('isPointOnLine', () => {
    it('returns true when provided point is on line', () => {
      expect(geo.isPointOnLine(new Point2(), new Point2(1, 1), new Point2(2, 2))).toBeTruthy()
    })

    it('returns false when provided point is not on line', () => {
      expect(geo.isPointOnLine(new Point2(), new Point2(5), new Point2(3, 4))).toBeFalsy()
    })
  })

  describe('isPointRightOfLine', () => {
    it('returns true when provided point right of line', () => {
      expect(geo.isPointRightOfLine(new Point2(), new Point2(1, 1), new Point2(2, 1))).toBeTruthy()
    })

    it('returns false when provided point is left or on line', () => {
      expect(geo.isPointRightOfLine(new Point2(), new Point2(1, 1), new Point2(2, 2))).toBeFalsy()
      expect(geo.isPointRightOfLine(new Point2(), new Point2(1, 1), new Point2(1, 2))).toBeFalsy()
    })
  })

  describe('segmentTouchesOrCrosses', () => {
    it('returns true when second segment is on first', () => {
      expect(geo.segmentTouchesOrCrosses(new Point2(), new Point2(2, 2), new Point2(1, 1), new Point2(1,2))).toBeTruthy()
    })

    it('returns true when second segment crosses first', () => {
      expect(geo.segmentTouchesOrCrosses(new Point2(1, 0), new Point2(1, 2), new Point2(0, 1), new Point2(2, 1))).toBeTruthy()
    })

    it('returns true if as lines they would intersect', () => {
      // ---
      //  |
      expect(geo.segmentTouchesOrCrosses(new Point2(1, 0), new Point2(1, 2), new Point2(0, 3), new Point2(2, 3))).toBeTruthy()
      //  |
      //
      //  |
      expect(geo.segmentTouchesOrCrosses(new Point2(1, 0), new Point2(1, 2), new Point2(1, 3), new Point2(1, 4))).toBeTruthy()
    })

    it('returns false when neither segment intersects', () => {
      // | |
      expect(geo.segmentTouchesOrCrosses(new Point2(1, 0), new Point2(1, 2), new Point2(2, 0), new Point2(2, 2))).toBeFalsy()
    })
  })

  describe('getSegmentBB', () => {
    it('returns the axis aligned a bounding box of points that contain the passed in line segments', () => {
      const aabb = geo.getSegmentBB(new Point2(), new Point2(2, 2))
      expect(aabb[0].x).toBe(0)
      expect(aabb[0].y).toBe(0)
      expect(aabb[1].x).toBe(2)
      expect(aabb[1].y).toBe(2)
    })
  })

  describe('segmentsBBIntersect', () => {
    it('returns true when segments bb intersect', () => {
      expect(geo.segmentsBBIntersect(new Point2(), new Point2(5, 5), new Point2(3, 3), new Point2(6, 6))).toBeTruthy()
      expect(geo.segmentsBBIntersect(new Point2(), new Point2(5, 5), new Point2(5, 5), new Point2(6, 6))).toBeTruthy()
      // inside
      expect(geo.segmentsBBIntersect(new Point2(), new Point2(5, 5), new Point2(1, 1), new Point2(3, 3))).toBeTruthy()
    })

    it('returns false when segments bb do not intersect', () => {
      expect(geo.segmentsBBIntersect(new Point2(), new Point2(5, 5), new Point2(10, 10), new Point2(100, 100))).toBeFalsy()
      expect(geo.segmentsBBIntersect(new Point2(), new Point2(5, 5), new Point2(10, 0), new Point2(100, 100))).toBeFalsy()
    })
  })

  describe('segmentsIntersect', () => {
    it('returns true for intersecting segments', () => {
      expect(geo.segmentsIntersect(new Point2(1, 0), new Point2(1, 2), new Point2(0, 1), new Point2(2, 1))).toBeTruthy()
    })

    it('returns true for touching segments', () => {
      expect(geo.segmentsIntersect(new Point2(), new Point2(2, 2), new Point2(1, 1), new Point2(1,2))).toBeTruthy()
    })

    it('returns false for intersecting lines but non intersecting segments', () => {
      // ---
      //  |
      expect(geo.segmentsIntersect(new Point2(1, 0), new Point2(1, 2), new Point2(0, 3), new Point2(2, 3))).toBeFalsy()
      //  |
      //
      //  |
      expect(geo.segmentsIntersect(new Point2(1, 0), new Point2(1, 2), new Point2(1, 3), new Point2(1, 4))).toBeFalsy()
    })

    it('returns false segments with overlapping bounding boxes', () => {
      // \
      //  \ ---
      //   \
      //    \
      //     \
      expect(geo.segmentsIntersect(new Point2(0, 5), new Point2(5, 0), new Point2(4, 3), new Point2(6, 3))).toBeFalsy()
      expect(geo.segmentsIntersect(new Point2(0, 5), new Point2(5, 0), new Point2(4, 3), new Point2(5, 3))).toBeFalsy()
      expect(geo.segmentsIntersect(new Point2(0, 5), new Point2(5, 0), new Point2(4, 3), new Point2(4.5, 3))).toBeFalsy()
    })
  })

  describe('pointsAtPos', () => {
    it('', () => {
    })
  })

  describe('intersectsWith', () => {
    it('returns true for overlapping geometry', () => {
      const otherGeo = new Geo()
      otherGeo.aabb = aabb2
      otherGeo.points = tri2
      geo.aabb = aabb1
      geo.points = tri1
      expect(geo.intersectsWith(otherGeo)).toBe(true)
      expect(otherGeo.intersectsWith(geo)).toBe(true)
    })

    it('returns false for completely separate geometry', () => {
      const otherGeo = new Geo()
      otherGeo.aabb = aabb3
      otherGeo.points = tri3
      geo.aabb = aabb1
      geo.points = tri1
      expect(geo.intersectsWith(otherGeo)).toBe(false)
      expect(otherGeo.intersectsWith(geo)).toBe(false)
    })

    it('returns true for a point inside another geometry', () => {
      const otherGeo = new Geo()
      otherGeo.treatAsPoint = true
      otherGeo.pos.x = 5
      otherGeo.pos.y = 5
      otherGeo.aabb.max.x = 1
      otherGeo.aabb.max.y = 1
      geo.aabb = aabb1
      geo.points = tri1
      geo.points.push(new Point2(10, 0))
      expect(geo.intersectsWith(otherGeo)).toBe(true)
      expect(otherGeo.intersectsWith(geo)).toBe(true)
    })

    it('returns false for a point inside another bb but outside its geometry', () => {
      // ---
      // | /
      // |/ . <--- point
      const otherGeo = new Geo()
      otherGeo.treatAsPoint = true
      otherGeo.pos.x = 9
      otherGeo.pos.y = 1
      otherGeo.aabb.max.x = 1
      otherGeo.aabb.max.y = 1
      geo.aabb = aabb1
      geo.points = tri1
      expect(geo.aabbIntersects(otherGeo)).toBe(true)
      expect(geo.intersectsWith(otherGeo)).toBe(false)
      expect(otherGeo.intersectsWith(geo)).toBe(false)
    })

    it('returns false for a geometry inside another bb but outside its geometry', () => {
      // ---
      // | /
      // |/ o <--- other geo
      const otherGeo = new Geo()
      otherGeo.pos.x = 9
      otherGeo.pos.y = 1
      otherGeo.aabb.max.x = 2
      otherGeo.aabb.max.y = 2
      otherGeo.points = [new Point2(), new Point2(0, 2), new Point2(2, 2)]
      geo.aabb = aabb1
      geo.points = tri1
      expect(geo.aabbIntersects(otherGeo)).toBe(true)
      expect(geo.intersectsWith(otherGeo)).toBe(false)
      expect(otherGeo.intersectsWith(geo)).toBe(false)
    })
  })
})
