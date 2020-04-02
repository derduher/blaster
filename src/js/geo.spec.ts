import Geo from "./Geo";
import Point2 from "./Point2";
import { generateObj } from "./spec-helper";
describe("Geo", () => {
  let geo: Geo;
  let geo2: Geo;
  let geo3: Geo;
  beforeEach(() => {
    geo = new Geo([new Point2(), new Point2(0, 10), new Point2(10, 10)]);
    geo2 = new Geo([new Point2(3, 3), new Point2(20, 3), new Point2(3, 20)]);
    geo3 = new Geo([
      new Point2(40, 40),
      new Point2(40, 50),
      new Point2(50, 50),
    ]);
  });

  describe("distanceTo", () => {
    // note geometry position is not in the center of geometry
    it("returns the distance from the geometry position to the passed in point", () => {
      expect(geo.distanceTo(new Point2())).toBe(0);
      expect(geo.distanceTo(new Point2(3, 4))).toBe(5);
    });
  });

  describe("distanceToObj", () => {
    it("unwraps passed in obj to its position", () => {
      const obj = generateObj();
      spyOn(geo, "distanceTo");
      geo.distanceToObj(obj);
      expect(geo.distanceTo).toHaveBeenCalledWith(obj.geo.pos);
    });
  });

  describe("aabbIntersects", () => {
    it("returns true if two geometries intersect", () => {
      expect(geo.aabbIntersects(geo2)).toBe(true);
      expect(geo2.aabbIntersects(geo)).toBe(true);
    });

    it("returns false if two geometries do not intersect", () => {
      expect(geo.aabbIntersects(geo3)).toBe(false);
      expect(geo3.aabbIntersects(geo)).toBe(false);
    });
  });

  describe("crossProduct", () => {
    it("calculates correctly", () => {
      expect(Geo.crossProduct(new Point2(), new Point2())).toBe(0);
      expect(Geo.crossProduct(new Point2(1, 1), new Point2(1, 1))).toBe(0);
      expect(Geo.crossProduct(new Point2(10, 10), new Point2(10, 10))).toBe(0);
      expect(Geo.crossProduct(new Point2(10, 10), new Point2(1, 1))).toBe(0);
      expect(Geo.crossProduct(new Point2(10, 4), new Point2(1, 1))).toBe(6);
    });
  });

  describe("isPointOnLine", () => {
    it("returns true when provided point is on line", () => {
      expect(
        Geo.isPointOnLine(new Point2(), new Point2(1, 1), new Point2(2, 2))
      ).toBeTruthy();
    });

    it("returns false when provided point is not on line", () => {
      expect(
        Geo.isPointOnLine(new Point2(), new Point2(5), new Point2(3, 4))
      ).toBeFalsy();
    });
  });

  describe("isPointRightOfLine", () => {
    it("returns true when provided point right of line", () => {
      expect(
        Geo.isPointRightOfLine(new Point2(), new Point2(1, 1), new Point2(2, 1))
      ).toBeTruthy();
    });

    it("returns false when provided point is left or on line", () => {
      expect(
        Geo.isPointRightOfLine(new Point2(), new Point2(1, 1), new Point2(2, 2))
      ).toBeFalsy();

      expect(
        Geo.isPointRightOfLine(new Point2(), new Point2(1, 1), new Point2(1, 2))
      ).toBeFalsy();
    });
  });

  describe("segmentTouchesOrCrosses", () => {
    it("returns true when second segment is on first", () => {
      expect(
        Geo.segmentTouchesOrCrosses(
          new Point2(),
          new Point2(2, 2),
          new Point2(1, 1),
          new Point2(1, 2)
        )
      ).toBeTruthy();
    });

    it("returns true when second segment crosses first", () => {
      expect(
        Geo.segmentTouchesOrCrosses(
          new Point2(1, 0),
          new Point2(1, 2),
          new Point2(0, 1),
          new Point2(2, 1)
        )
      ).toBeTruthy();
    });

    it("returns true if as lines they would intersect", () => {
      // ---
      //  |
      expect(
        Geo.segmentTouchesOrCrosses(
          new Point2(1, 0),
          new Point2(1, 2),
          new Point2(0, 3),
          new Point2(2, 3)
        )
      ).toBeTruthy();

      //  |
      //
      //  |
      expect(
        Geo.segmentTouchesOrCrosses(
          new Point2(1, 0),
          new Point2(1, 2),
          new Point2(1, 3),
          new Point2(1, 4)
        )
      ).toBeTruthy();
    });

    it("returns false when neither segment intersects", () => {
      // | |
      expect(
        Geo.segmentTouchesOrCrosses(
          new Point2(1, 0),
          new Point2(1, 2),
          new Point2(2, 0),
          new Point2(2, 2)
        )
      ).toBeFalsy();
    });
  });

  describe("getSegmentBB", () => {
    it("returns the axis aligned a bounding box of points that contain the passed in line segments", () => {
      const aabb = Geo.getSegmentBB(new Point2(), new Point2(2, 2));
      expect(aabb[0].x).toBe(0);
      expect(aabb[0].y).toBe(0);
      expect(aabb[1].x).toBe(2);
      expect(aabb[1].y).toBe(2);
    });
  });

  describe("segmentsBBIntersect", () => {
    it("returns true when segments bb intersect", () => {
      expect(
        Geo.segmentsBBIntersect(
          new Point2(),
          new Point2(5, 5),
          new Point2(3, 3),
          new Point2(6, 6)
        )
      ).toBeTruthy();

      expect(
        Geo.segmentsBBIntersect(
          new Point2(),
          new Point2(5, 5),
          new Point2(5, 5),
          new Point2(6, 6)
        )
      ).toBeTruthy();

      // inside
      expect(
        Geo.segmentsBBIntersect(
          new Point2(),
          new Point2(5, 5),
          new Point2(1, 1),
          new Point2(3, 3)
        )
      ).toBeTruthy();
    });

    it("returns false when segments bb do not intersect", () => {
      expect(
        Geo.segmentsBBIntersect(
          new Point2(),
          new Point2(5, 5),
          new Point2(10, 10),
          new Point2(100, 100)
        )
      ).toBeFalsy();

      expect(
        Geo.segmentsBBIntersect(
          new Point2(),
          new Point2(5, 5),
          new Point2(10, 0),
          new Point2(100, 100)
        )
      ).toBeFalsy();
    });
  });

  describe("segmentsIntersect", () => {
    it("returns true for intersecting segments", () => {
      expect(
        Geo.segmentsIntersect(
          new Point2(1, 0),
          new Point2(1, 2),
          new Point2(0, 1),
          new Point2(2, 1)
        )
      ).toBeTruthy();
    });

    it("returns true for touching segments", () => {
      expect(
        Geo.segmentsIntersect(
          new Point2(),
          new Point2(2, 2),
          new Point2(1, 1),
          new Point2(1, 2)
        )
      ).toBeTruthy();
    });

    it("returns false for intersecting lines but non intersecting segments", () => {
      // ---
      //  |
      expect(
        Geo.segmentsIntersect(
          new Point2(1, 0),
          new Point2(1, 2),
          new Point2(0, 3),
          new Point2(2, 3)
        )
      ).toBeFalsy();

      //  |
      //
      //  |
      expect(
        Geo.segmentsIntersect(
          new Point2(1, 0),
          new Point2(1, 2),
          new Point2(1, 3),
          new Point2(1, 4)
        )
      ).toBeFalsy();
    });

    it("returns false segments with overlapping bounding boxes", () => {
      // \
      //  \ ---
      //   \
      //    \
      //     \
      expect(
        Geo.segmentsIntersect(
          new Point2(0, 5),
          new Point2(5, 0),
          new Point2(4, 3),
          new Point2(6, 3)
        )
      ).toBeFalsy();

      expect(
        Geo.segmentsIntersect(
          new Point2(0, 5),
          new Point2(5, 0),
          new Point2(4, 3),
          new Point2(5, 3)
        )
      ).toBeFalsy();

      expect(
        Geo.segmentsIntersect(
          new Point2(0, 5),
          new Point2(5, 0),
          new Point2(4, 3),
          new Point2(4.5, 3)
        )
      ).toBeFalsy();
    });
  });

  describe("pointsAtPos", () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it("", () => {});
  });

  describe("intersectsWith", () => {
    it("returns true for overlapping geometry", () => {
      expect(geo.intersectsWith(geo2)).toBe(true);
      expect(geo2.intersectsWith(geo)).toBe(true);
    });

    it("returns false for completely separate geometry", () => {
      expect(geo.intersectsWith(geo3)).toBe(false);
      expect(geo3.intersectsWith(geo)).toBe(false);
    });

    it("returns true for a point inside another geometry", () => {
      const otherGeo = new Geo(
        [new Point2(), new Point2(1, 1)],
        new Point2(5, 5)
      );
      otherGeo.treatAsPoint = true;
      geo.points.push(new Point2(10, 0));
      expect(geo.intersectsWith(otherGeo)).toBe(true);
      expect(otherGeo.intersectsWith(geo)).toBe(true);
    });

    it("returns false for a point inside another bb but outside its geometry", () => {
      // ---
      // | /
      // |/ . <--- point
      const otherGeo = new Geo(
        [new Point2(), new Point2(1, 1)],
        new Point2(9, 1)
      );
      otherGeo.treatAsPoint = true;
      expect(geo.aabbIntersects(otherGeo)).toBe(true);
      expect(geo.intersectsWith(otherGeo)).toBe(false);
      expect(otherGeo.intersectsWith(geo)).toBe(false);
    });

    it("returns false for a geometry inside another bb but outside its geometry", () => {
      // ---
      // | /
      // |/ o <--- other geo
      const otherGeo = new Geo(
        [new Point2(), new Point2(0, 2), new Point2(2, 2)],
        new Point2(9, 1)
      );
      expect(geo.aabbIntersects(otherGeo)).toBe(true);
      expect(geo.intersectsWith(otherGeo)).toBe(false);
      expect(otherGeo.intersectsWith(geo)).toBe(false);
    });
  });
});
