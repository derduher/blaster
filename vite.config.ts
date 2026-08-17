import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // The game is served from a subpath of nimblerendition.com, alongside the
  // other apps on that domain. Every asset URL, the PWA scope, and the S3
  // upload prefix have to agree on this value.
  base: "/blaster/",
  publicDir: "static",
  build: {
    outDir: "dist",
  },
  plugins: [
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      manifest: false,
      // Registering sw.js under /blaster/ keeps the service worker's scope off
      // the domain root, so it can't hijack the other apps or the root page.
      scope: "/blaster/",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        navigateFallback: "/blaster/index.html",
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/js/**/*.spec.ts"],
    server: {
      deps: {
        inline: ["vitest-canvas-mock"],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/js/**/*.{ts,tsx}"],
      exclude: ["src/js/**/*.spec.*", "src/js/types.ts"],
    },
  },
});
