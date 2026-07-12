import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("activate", () => {
  cleanupOutdatedCaches();
});
