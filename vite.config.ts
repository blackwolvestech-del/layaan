import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Static frontend only: no dev proxy and no API. Three.js, GSAP and Lenis are dynamically
// imported by the components that use them, so they load as separate on-demand chunks.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  // The only chunk above 500 kB is Three.js for the decorative silk layer; it is lazy-loaded
  // when that section scrolls into view, so it never blocks the first render.
  build: { target: "es2022", sourcemap: true, chunkSizeWarningLimit: 600 },
  server: { port: 5173 },
  preview: { port: 4173 },
  test: { environment: "jsdom", include: ["tests/**/*.test.{ts,tsx}"] },
});
