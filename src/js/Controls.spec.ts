import Controls from "./Controls";

const keyEvent = (code: string): KeyboardEvent =>
  new KeyboardEvent("keydown", { code });

describe("Controls", () => {
  let ctrl: Controls;
  beforeEach(() => {
    ctrl = new Controls();
  });

  describe("press-activated actions", () => {
    it("sets movement flags while a key is held", () => {
      ctrl.kd(keyEvent("KeyA"));
      expect(ctrl.left).toBe(true);
      ctrl.ku(keyEvent("KeyA"));
      expect(ctrl.left).toBe(false);
    });

    it("maps KeyQ to weaponPrev", () => {
      ctrl.kd(keyEvent("KeyQ"));
      expect(ctrl.weaponPrev).toBe(true);
      expect(ctrl.weaponNext).toBe(false);
    });

    it("maps KeyE to weaponNext", () => {
      ctrl.kd(keyEvent("KeyE"));
      expect(ctrl.weaponNext).toBe(true);
      expect(ctrl.weaponPrev).toBe(false);
    });

    it("maps KeyP to pause", () => {
      ctrl.kd(keyEvent("KeyP"));
      expect(ctrl.pause).toBe(true);
    });
  });

  describe("toggle actions", () => {
    it("toggles fullscreen on F keyup", () => {
      ctrl.ku(keyEvent("KeyF"));
      expect(ctrl.toggleFS).toBe(true);
      ctrl.ku(keyEvent("KeyF"));
      expect(ctrl.toggleFS).toBe(false);
    });

    it("toggles autoBreak on R keyup independent of fullscreen state", () => {
      ctrl.ku(keyEvent("KeyR"));
      expect(ctrl.autoBreak).toBe(true);
      ctrl.ku(keyEvent("KeyR"));
      expect(ctrl.autoBreak).toBe(false);

      ctrl.toggleFS = true;
      ctrl.ku(keyEvent("KeyR"));
      expect(ctrl.autoBreak).toBe(true);
      ctrl.ku(keyEvent("KeyR"));
      expect(ctrl.autoBreak).toBe(false);
    });
  });

  describe("touch", () => {
    it("stores touch position on setTouch", () => {
      ctrl.setTouch(5, 6);
      expect(ctrl.touch).toBe(true);
      expect(ctrl.touchX).toBe(5);
      expect(ctrl.touchY).toBe(6);
    });

    it("clears the touch flag on clearTouch", () => {
      ctrl.setTouch(5, 6);
      ctrl.clearTouch();
      expect(ctrl.touch).toBe(false);
    });
  });

  describe("reset", () => {
    it("clears all pressed state so keys cannot stick across focus loss", () => {
      ctrl.kd(keyEvent("KeyA"));
      ctrl.kd(keyEvent("KeyW"));
      ctrl.kd(keyEvent("Space"));
      ctrl.setTouch(1, 2);
      ctrl.reset();
      expect(ctrl.left).toBe(false);
      expect(ctrl.up).toBe(false);
      expect(ctrl.fire).toBe(false);
      expect(ctrl.touch).toBe(false);
    });
  });

  it("does not log to the console on keyup", () => {
    const log = vi.spyOn(console, "log");
    ctrl.ku(keyEvent("KeyA"));
    expect(log).not.toHaveBeenCalled();
  });
});
