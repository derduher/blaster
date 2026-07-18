import Game from "./Game";

describe("Game", () => {
  let game: Game;
  let when: number;
  beforeEach(() => {
    game = new Game(document.createElement("canvas"));
    when = performance.now();
  });

  it("instantiates", () => {
    expect(game.stage).toBeDefined();
  });

  describe("main", () => {
    beforeEach(() => {
      vi.spyOn(window, "requestAnimationFrame");
      vi.spyOn(game, "draw");
      vi.spyOn(game, "updates").mockImplementation(() => {
        /* isolate main()'s tick-count computation from real tick side effects */
      });
      game.lastTick = when;
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
      game.main(when + 34);
      expect(game.updates).toHaveBeenNthCalledWith(3, 2);
    });

    it("caps catch-up ticks and drops the remaining debt", () => {
      // mirror the real updates(): advance game time by the ticks run
      vi.mocked(game.updates).mockImplementation((numTicks: number): void => {
        game.lastTick += numTicks * game.tickLength;
      });
      game.main(when + 1000);
      expect(game.updates).toHaveBeenNthCalledWith(1, 4);
      // after a capped frame the game must not keep fast-forwarding
      game.main(when + 1001);
      expect(game.updates).toHaveBeenNthCalledWith(2, 0);
    });

    it("consumes the fullscreen toggle instead of re-triggering every frame", () => {
      vi.spyOn(game, "pause").mockImplementation(() => {
        /* isolate from canvas modal drawing */
      });
      game.ctrl.toggleFS = true;
      game.main(when);
      expect(game.pause).toHaveBeenCalledTimes(1);
      expect(game.ctrl.toggleFS).toBe(false);
      // pausing must not be immediately overdrawn by this frame's draw
      expect(game.draw).not.toHaveBeenCalled();
      game.main(when + 17);
      expect(game.pause).toHaveBeenCalledTimes(1);
    });
  });

  describe("input wiring", () => {
    it("resumes from pause on space keyup using KeyboardEvent.code", () => {
      vi.spyOn(game, "resume").mockImplementation(() => {
        /* don't start the real loop */
      });
      game.stopMain = 0;
      game.pausedOnKeyUp(new KeyboardEvent("keyup", { code: "Space" }));
      expect(game.resume).toHaveBeenCalled();
    });

    it("resumes when the canvas is clicked while paused", () => {
      vi.spyOn(game, "resume").mockImplementation(() => {
        /* don't start the real loop */
      });
      game.started = true;
      game.stopMain = 0;
      game.stage.canvas.dispatchEvent(new MouseEvent("click"));
      expect(game.resume).toHaveBeenCalled();
    });

    it("clears pressed keys when the window loses focus", () => {
      game.ctrl.left = true;
      game.ctrl.fire = true;
      window.dispatchEvent(new Event("blur"));
      expect(game.ctrl.left).toBe(false);
      expect(game.ctrl.fire).toBe(false);
    });

    it("converts device coordinates to native game coordinates", () => {
      // jsdom window is 1024x768; scale = min(1024/1920, 768/1080)
      const scale = Math.min(1024 / 1920, 768 / 1080);
      const native = game.deviceToNative(512, 384);
      expect(native.x).toBeCloseTo(512 / scale);
      expect(native.y).toBeCloseTo(384 / scale);
    });

    it("feeds touch positions to the controls in native coordinates", () => {
      const scale = Math.min(1024 / 1920, 768 / 1080);
      const ev = new Event("touchmove") as unknown as {
        touches: { clientX: number; clientY: number }[];
      };
      ev.touches = [{ clientX: 512, clientY: 384 }];
      game.stage.canvas.dispatchEvent(ev as unknown as Event);
      expect(game.ctrl.touch).toBe(true);
      expect(game.ctrl.touchX).toBeCloseTo(512 / scale);
      expect(game.ctrl.touchY).toBeCloseTo(384 / scale);
    });

    it("ends the touch on touchend", () => {
      game.ctrl.setTouch(1, 2);
      game.stage.canvas.dispatchEvent(new Event("touchend"));
      expect(game.ctrl.touch).toBe(false);
    });
  });

  describe("service worker updates", () => {
    it("stores the updater and flags an update as ready", () => {
      const updater = vi.fn().mockResolvedValue(undefined);
      game.updateReady(updater);
      expect(game.updateIsReady).toBe(true);
    });

    it("applies a ready update when U is pressed while paused", () => {
      const updater = vi.fn().mockResolvedValue(undefined);
      game.updateReady(updater);
      game.pausedOnKeyUp(new KeyboardEvent("keyup", { code: "KeyU" }));
      expect(updater).toHaveBeenCalledWith(true);
    });

    it("does not apply an update when none is ready", () => {
      expect(() =>
        game.pausedOnKeyUp(new KeyboardEvent("keyup", { code: "KeyU" })),
      ).not.toThrow();
    });
  });

  describe("update", () => {
    it("consumes the pause action", () => {
      vi.spyOn(game, "togglePause").mockImplementation(() => {
        /* don't start the real loop */
      });
      game.ctrl.pause = true;
      game.update(1);
      expect(game.togglePause).toHaveBeenCalledTimes(1);
      expect(game.ctrl.pause).toBe(false);
    });
  });

  describe("canvas resize", () => {
    it("scales the backing store by devicePixelRatio and keeps the device-to-native mapping stable", () => {
      const original = window.devicePixelRatio;
      Object.defineProperty(window, "devicePixelRatio", {
        value: 2,
        configurable: true,
      });
      game.updateCanvasBoundaries();
      expect(game.stage.canvas.width).toBe(window.innerWidth * 2);
      expect(game.stage.canvas.style.width).toBe(window.innerWidth + "px");
      // a CSS pixel must map to the same native point regardless of dpr
      const scale1x = Math.min(1024 / 1920, 768 / 1080);
      const native = game.deviceToNative(512, 384);
      expect(native.x).toBeCloseTo(512 / scale1x);
      Object.defineProperty(window, "devicePixelRatio", {
        value: original,
        configurable: true,
      });
      game.updateCanvasBoundaries();
    });

    it("redraws the instructions when resized before the game starts", () => {
      vi.spyOn(game, "showInstructions");
      window.dispatchEvent(new Event("resize"));
      expect(game.showInstructions).toHaveBeenCalled();
    });

    it("draws modal text in white even after a canvas reset", () => {
      // setting canvas.width resets all context state, fillStyle included
      game.stage.canvas.width = 800;
      const styles: (string | CanvasGradient | CanvasPattern)[] = [];
      const ctx = game.ctx;
      if (!ctx) throw new Error("no 2d context");
      vi.spyOn(ctx, "fillText").mockImplementation((): void => {
        styles.push(ctx.fillStyle);
      });
      game.messageModal(["hello"]);
      expect(styles.length).toBeGreaterThan(0);
      for (const style of styles) {
        expect(style).toBe("#ffffff");
      }
    });
  });

  describe("craft placement", () => {
    it("starts the craft centered near the bottom of the native space", () => {
      expect(game.craft.geo.pos.x).toBe(1920 / 2 - 48 / 2);
      expect(game.craft.geo.pos.y).toBe(1080 - 48 - game.stage.padding);
    });
  });
});
