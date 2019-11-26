enum Actions {
  left,
  right,
  up,
  down,
  fire,
  weaponNext,
  weaponPrev,
  toggleFS,
  autoBreak,
  pause
}
const pressActivated = new Set([
  Actions.left,
  Actions.right,
  Actions.up,
  Actions.down,
  Actions.pause,
  Actions.weaponNext,
  Actions.weaponPrev,
  Actions.fire
]);
const toggle = new Set([Actions.autoBreak, Actions.toggleFS]);

interface KeyBindings {
  KeyA: Actions.left;
  ArrowLeft: Actions.left;
  KeyD: Actions.right;
  ArrowRight: Actions.right;
  KeyW: Actions.up;
  ArrowUp: Actions.up;
  KeyS: Actions.down;
  ArrowDown: Actions.down;
  Space: Actions.fire;
  KeyQ: Actions.weaponPrev;
  KeyE: Actions.weaponPrev;
  Escape: Actions.toggleFS;
  KeyR: Actions.autoBreak;
  KeyF: Actions.toggleFS;
}
const keyBindings: KeyBindings = {
  KeyA: Actions.left,
  ArrowLeft: Actions.left,
  KeyD: Actions.right,
  ArrowRight: Actions.right,
  KeyW: Actions.up,
  ArrowUp: Actions.up,
  KeyS: Actions.down,
  ArrowDown: Actions.down,
  Space: Actions.fire,
  KeyQ: Actions.weaponPrev,
  KeyE: Actions.weaponPrev,
  Escape: Actions.toggleFS,
  KeyR: Actions.autoBreak,
  KeyF: Actions.toggleFS
};

const codeToAction = (code: KeyboardEvent["code"]): Actions | undefined => {
  return keyBindings[code as keyof KeyBindings];
};

export default class Controls {
  touch = false;
  touchX = 0;
  touchY = 0;
  left = false;
  right = false;
  up = false;
  down = false;
  fire = false;
  weaponNext = false;
  weaponPrev = false;
  toggleFS = false;
  pause = false;
  autoBreak = false;

  setAction(action: Actions, value: boolean): void {
    switch (action) {
      case Actions.up:
        this.up = value;
        break;
      case Actions.right:
        this.right = value;
        break;
      case Actions.down:
        this.down = value;
        break;
      case Actions.left:
        this.left = value;
        break;
      case Actions.fire:
        this.fire = value;
        break;
      case Actions.weaponNext:
        this.weaponNext = value;
        break;
      case Actions.weaponPrev:
        this.weaponPrev = value;
        break;
      case Actions.pause:
        this.pause = value;
        break;
      case Actions.toggleFS:
        this.toggleFS = value;
        break;
      case Actions.autoBreak:
        this.autoBreak = value;
        break;
    }
  }

  kd({ code }: KeyboardEvent): void {
    const action = codeToAction(code);
    if (action !== undefined && pressActivated.has(action)) {
      this.setAction(action, true);
    }
  }

  ku({ code }: KeyboardEvent): void {
    const action = codeToAction(code);
    if (action !== undefined) {
      console.log(action);
      if (pressActivated.has(action)) {
        this.setAction(action, false);
      }

      if (toggle.has(action)) {
        if (action === Actions.toggleFS) {
          this.setAction(action, !this.toggleFS);
        } else if (action === Actions.autoBreak) {
          this.setAction(action, !this.toggleFS);
        }
      }
    }
  }
}
