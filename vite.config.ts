// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const basePath = process.env['VITE_BASE_PATH'] || "/";

export default defineConfig({
  vite: {
    base: basePath,
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  },
  tanstackStart: {
    // GitHub Pages serves static files only; generate an SPA shell for client-side routing.
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index.html",
        crawlLinks: false,
      },
    },
    // Keep the existing server entry configuration for non-static environments.
    server: { entry: "server" },
  },
});
