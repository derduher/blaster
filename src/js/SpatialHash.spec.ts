import SpatialHash from "./SpatialHash";
import Geo from "./Geo";
import Point2 from "./Point2";

const boxAt = (x: number, y: number, size = 10): Geo =>
  new Geo(
    [
      new Point2(0, 0),
      new Point2(size, 0),
      new Point2(size, size),
      new Point2(0, size),
    ],
    new Point2(x, y),
  );

describe("SpatialHash", () => {
  let hash: SpatialHash<string>;
  beforeEach(() => {
    hash = new SpatialHash<string>(1000, 1000, 100);
  });

  it("finds objects registered in the same cell", () => {
    hash.registerObject("a", boxAt(10, 10));
    hash.registerObject("b", boxAt(20, 20));
    expect([...hash.getNearby(boxAt(15, 15))]).toEqual(
      expect.arrayContaining(["a", "b"]),
    );
  });

  it("does not return distant objects", () => {
    hash.registerObject("a", boxAt(10, 10));
    hash.registerObject("far", boxAt(900, 900));
    expect([...hash.getNearby(boxAt(15, 15))]).not.toContain("far");
  });

  it("finds an object spanning multiple cells from any of them", () => {
    hash.registerObject("wide", boxAt(50, 50, 300));
    expect([...hash.getNearby(boxAt(320, 60))]).toContain("wide");
  });

  it("finds objects hanging past the world bounds", () => {
    hash.registerObject("edge", boxAt(-40, -40, 60));
    expect([...hash.getNearby(boxAt(5, 5))]).toContain("edge");
  });

  it("clears all buckets on clearMap", () => {
    hash.registerObject("a", boxAt(10, 10));
    hash.clearMap();
    expect([...hash.getNearby(boxAt(10, 10))]).toEqual([]);
  });

  it("iterates occupied cells for debug overlays", () => {
    hash.registerObject("a", boxAt(10, 10));
    const cells = [...hash.occupiedCells()];
    expect(cells).toEqual([{ x: 0, y: 0, size: 100 }]);
  });
});
