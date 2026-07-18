import Geo from "./Geo";

/**
 * Broad-phase collision grid. The world is divided into fixed-size cells;
 * each object is registered into every cell its world AABB touches, and
 * getNearby returns everything sharing a cell with the queried geometry.
 *
 * Buckets and the nearby set are reused across calls to avoid per-tick
 * allocation churn, so the set returned by getNearby is only valid until
 * the next getNearby call.
 */
export default class SpatialHash<T> {
  private buckets: Set<T>[];
  private nearby = new Set<T>();
  private cols: number;
  private rows: number;

  public constructor(
    width: number,
    height: number,
    private cellSize: number,
  ) {
    this.cols = Math.max(1, Math.ceil(width / cellSize));
    this.rows = Math.max(1, Math.ceil(height / cellSize));
    this.buckets = Array.from(
      { length: this.cols * this.rows },
      (): Set<T> => new Set(),
    );
  }

  private forEachBucket(geo: Geo, cb: (bucket: Set<T>) => void): void {
    const clamp = (v: number, max: number): number =>
      Math.min(max, Math.max(0, v));
    const x0 = clamp(
      ((geo.pos.x + geo.aabb.min.x) / this.cellSize) | 0,
      this.cols - 1,
    );
    const x1 = clamp(
      ((geo.pos.x + geo.aabb.max.x) / this.cellSize) | 0,
      this.cols - 1,
    );
    const y0 = clamp(
      ((geo.pos.y + geo.aabb.min.y) / this.cellSize) | 0,
      this.rows - 1,
    );
    const y1 = clamp(
      ((geo.pos.y + geo.aabb.max.y) / this.cellSize) | 0,
      this.rows - 1,
    );
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        cb(this.buckets[y * this.cols + x]);
      }
    }
  }

  public registerObject(obj: T, geo: Geo): void {
    this.forEachBucket(geo, (bucket): void => {
      bucket.add(obj);
    });
  }

  public getNearby(geo: Geo): Set<T> {
    this.nearby.clear();
    this.forEachBucket(geo, (bucket): void => {
      for (const obj of bucket) {
        this.nearby.add(obj);
      }
    });
    return this.nearby;
  }

  public clearMap(): void {
    for (const bucket of this.buckets) {
      bucket.clear();
    }
  }

  // world-space rectangles of non-empty cells, for the debug overlay
  public *occupiedCells(): Generator<{ x: number; y: number; size: number }> {
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.buckets[i].size > 0) {
        yield {
          x: (i % this.cols) * this.cellSize,
          y: ((i / this.cols) | 0) * this.cellSize,
          size: this.cellSize,
        };
      }
    }
  }
}
