import Roid from "./Roid";
import genPos from "./roidPosFactory";
import Stage from "./Stage";
import { generateStage } from "./spec-helper";

describe("Roid", () => {
  let roid: Roid;
  let stage: Stage;
  beforeEach(() => {
    stage = generateStage();
    roid = new Roid(genPos(1000, 1000), stage);
  });

  it("generates random points", () => {
    expect(roid.geo.points.length).toBeGreaterThan(2);
    expect(new Roid(genPos(1000, 1000), stage).geo.points[0].x).not.toBe(
      roid.geo.points[0].x
    );
  });
});
