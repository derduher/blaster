import Vector2 from "./Vector2";
import Point2 from "./Point2";
import genPos from "./roidPosFactory";

describe("genPos", () => {
  it("returns a position", () => {
    const { pos } = genPos(1000, 1000);
    expect(pos instanceof Point2).toBe(true);
  });

  it("returns a vecor", () => {
    const { v } = genPos(1000, 1000);
    expect(v instanceof Vector2).toBe(true);
  });
});
