import Vector2 from "./Vector2";

describe("Vector2", () => {
  let v0;
  let v1;
  let v2;
  let v3;
  beforeEach(() => {
    v0 = new Vector2();
    v1 = new Vector2(1, 3);
    v2 = new Vector2(2, 10);
    v3 = new Vector2(3, 7);
  });

  it("correctly calculates the dot product", () => {
    expect(v0.dot(v0)).toBe(0);
    expect(v1.dot(v2)).toBe(32);
    expect(v2.dot(v3)).toBe(76);
    expect(v3.dot(v3)).toBe(58);
  });

  it("correctly calculates the cross product", () => {
    expect(v0.cross(v0)).toBe(0);
    expect(v1.cross(v2)).toBe(4);
    expect(v2.cross(v3)).toBe(-16);
    expect(v3.cross(v2)).toBe(16);
    expect(v3.cross(v3)).toBe(0);
  });
});
