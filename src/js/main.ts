import "../css/normalize.min.css";
import "../css/main.less";
import Game from "./Game";

async function registerServiceWorker(onUpdateReady: () => void): Promise<void> {
  const registration = await navigator.serviceWorker
    .register("/sw.js")
    .catch((e: unknown) => {
      console.log("failed to register serviceworker", e);
      return undefined;
    });
  if (!registration) {
    return;
  }
  if (registration.waiting) {
    onUpdateReady();
  }
  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    installing?.addEventListener("statechange", () => {
      if (
        installing.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        onUpdateReady();
      }
    });
  });
}

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
    void registerServiceWorker(() => game.updateReady());
  }
}

window.addEventListener("load", init);
