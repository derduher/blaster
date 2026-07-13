import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  publicDir: "static",
  build: {
    outDir: "dist",
  },
  css: {
    preprocessorOptions: {
      less: {
        strictMath: true,
      },
    },
    lightningcss: {
      // src/css/normalize.min.css carries old IE star-hack/`/deep/` syntax
      // that lightningcss otherwise rejects during minification.
      errorRecovery: true,
    },
  },
  plugins: [
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        navigateFallback: "/index.html",
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
