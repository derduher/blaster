import "../css/normalize.min.css";
import "../css/main.less";
import Game from "./Game";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import runtime from "serviceworker-webpack-plugin/lib/runtime";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import registerEvents from "serviceworker-webpack-plugin/lib/browser/registerEvents";

let game: Game;
function init(): void {
  const el = document.getElementById("tutorial");
  if (!el) {
    return;
  }
  game = new Game(el as HTMLCanvasElement);
  document.addEventListener("visibilitychange", () => {
    if (game.started && document.hidden) {
      game.pause();
    }
  });
  if ("serviceWorker" in navigator) {
    const registration = runtime.register().catch((e: any) => {
      console.log("failed to register serviceworker", e);
    });
    registerEvents(registration, {
      onUpdateReady: () => game.updateReady()
    });
  }
}

window.addEventListener("load", init);
