import Game from "./Game";
import Obj from "./Object";
import Stage from "./Stage";
import SpatialManager from "spatial-hashmap";
import Roid from "./Roid";
import { generateObj } from "./spec-helper";

describe("Game", () => {
  let game: Game;
  let stage: Stage;
  let when: number;
  let o: Obj;
  beforeEach(() => {
    stage = new Stage(
      document.createElement("canvas"),
      new SpatialManager<Obj>(1000, 1000, 10)
    );
    o = generateObj(stage);
    game = new Game(document.createElement("canvas"));
    when = performance.now();
  });

  it("instantiates", () => {
    expect(game.stage).toBeDefined();
  });

  describe("main", () => {
    beforeEach(() => {
      spyOn(window, "requestAnimationFrame");
      spyOn(game, "draw");
      spyOn(game, "updates");
    });

    it("schedules its next call", () => {
      game.main(performance.now());
      expect(window.requestAnimationFrame).toHaveBeenCalled();
    });

    it("draws", () => {
      game.main(performance.now());
      expect(game.draw).toHaveBeenCalled();
    });

    it("updates the proportial to how long its been since last call", () => {
      game.main(when);
      expect(game.updates).toHaveBeenCalledWith(0);
      game.main(when + 17);
      expect(game.updates).toHaveBeenNthCalledWith(2, 1);
      game.main(when + 32);
      expect(game.updates).toHaveBeenNthCalledWith(3, 2);
    });
  });

  describe("boundNTick", () => {
    it("prevents bound elements from going out of bounds", () => {
      o.boundToCanvas = true;
      o.geo.v.x = -100;
      o.geo.v.y = -100;
      game.boundNTick(o, 1);
      expect(o.geo.v.x).toBe(0);
      expect(o.geo.v.y).toBe(0);
    });

    it("culls elements when they go out of bounds", () => {
      o.geo.v.x = -100;
      o.geo.v.y = -100;
      spyOn(game.stage.spatialManager, "registerObject");
      expect(game.boundNTick(o, 1)).toBe(true);
      expect(o.geo.v.x).toBe(-100);
      expect(o.geo.v.y).toBe(-100);
      expect(game.stage.spatialManager.registerObject).not.toHaveBeenCalled();
    });

    it("moves objects according to their velocity", () => {
      o.geo.v.x = 100;
      o.geo.v.y = 100;
      expect(game.boundNTick(o, 1)).toBe(false);
      expect(o.geo.v.x).toBe(100);
      expect(o.geo.v.y).toBe(100);
    });
  });

  describe("update", () => {
    it("generates roids", () => {
      spyOn(Math, "random").and.returnValue(1);
      spyOn(game, "boundNTick");
      game.update(1);
      expect(game.stage.items[1] instanceof Roid).toBe(true);
    });

    it("culls objects that are out of bounds", () => {
      spyOn(Math, "random").and.returnValue(1);
      spyOn(game, "boundNTick").and.returnValue(true);
      game.update(1);
      expect(game.stage.items.length).toBe(0);
    });

    it("checks for intersection", () => {
      const nearby = new Set();
      nearby.add(o);
      nearby.add(generateObj(stage));
      spyOn(game, "boundNTick");
      spyOn(game, "testIntersect");
      spyOn(game.stage.spatialManager, "getNearby").and.returnValue(nearby);
      game.update(1);
      expect(game.testIntersect).toHaveBeenCalled();
    });
  });
});
