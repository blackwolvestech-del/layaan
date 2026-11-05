import { defineConfig } from "vitest/config";
import { loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";

/**
 * Serves the Vercel Functions in /api during `vite dev`, so checkout and order tracking work
 * locally exactly as in production (each file exports POST/GET(request: Request) => Response).
 * Server-only variables (e.g. SUPABASE_SERVICE_ROLE_KEY) are read from .env.local here and are
 * never exposed to the browser bundle (only VITE_* variables are).
 */
function apiDevServer(): Plugin {
  return {
    name: "layaan-api-dev",
    apply: "serve",
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, "");
      for (const [k, v] of Object.entries(env)) process.env[k] ??= v;
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();
        const route = req.url.split("?")[0]!.replace(/^\/api\//, "").replace(/\/$/, "");
        const file = path.resolve(server.config.root, "api", `${route}.ts`);
        if (!/^[a-z0-9/_-]+$/i.test(route) || route.split("/").some((s) => s.startsWith("_")) || !fs.existsSync(file)) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          return res.end(JSON.stringify({ error: "Not found" }));
        }
        try {
          const mod = (await server.ssrLoadModule(file)) as Record<string, (r: Request) => Promise<Response>>;
          const fn = mod[req.method ?? "GET"];
          if (!fn) {
            res.statusCode = 405;
            return res.end();
          }
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c as Buffer);
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers.set(k, v);
          const response = await fn(new Request(`http://localhost${req.url}`, { method: req.method, headers, body: chunks.length ? Buffer.concat(chunks) : undefined }));
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          server.ssrFixStacktrace(err as Error);
          next(err);
        }
      });
    },
  };
}

// Three.js, GSAP and Lenis are dynamically imported by the components that use them, so they load
// as separate on-demand chunks.
export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevServer()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  // The only chunk above 500 kB is Three.js for the decorative silk layer; it is lazy-loaded
  // when that section scrolls into view, so it never blocks the first render.
  build: { target: "es2022", sourcemap: true, chunkSizeWarningLimit: 600 },
  server: { port: 5173 },
  preview: { port: 4173 },
  test: { environment: "jsdom", include: ["tests/**/*.test.{ts,tsx}"], setupFiles: ["tests/setup.ts"] },
});
