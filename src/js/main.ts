import "../css/normalize.min.css";
import "../css/main.css";
import Game from "./Game";
import { registerSW } from "virtual:pwa-register";

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
    const updateSW = registerSW({
      onNeedRefresh() {
        game.updateReady(updateSW);
      },
      onRegisterError(error: unknown) {
        console.log("failed to register serviceworker", error);
      },
    });
  }
}

window.addEventListener("load", init);
