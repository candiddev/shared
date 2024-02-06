/* eslint-disable camelcase */

import path from "path";
import type { UserConfigExport } from "vite";
import { defineConfig, loadEnv, searchForWorkspaceRoot } from "vite";
import { imagetools } from "vite-imagetools";
import type { VitePWAOptions } from "vite-plugin-pwa";
import { VitePWA } from "vite-plugin-pwa";

export default (pwa: Partial<VitePWAOptions>): UserConfigExport => {
  return defineConfig(({ mode }) => {
    const env = {
      ...process.env,
      ...loadEnv(mode, process.cwd()),
    };

    return {
      build: {
        emptyOutDir: true,
        outDir: "../dist",
        sourcemap: env.NODE_ENV === "development",
      },
      define: {
        "process.env": {
          BUILD_VERSION: env.BUILD_VERSION,
          NODE_ENV: env.NODE_ENV,
          PUPPETEER_URL: env.PUPPETEER_URL,
        },
      },
      plugins: [imagetools(), pwa === undefined ? [] : VitePWA(pwa)],
      publicDir: "static",
      resolve: {
        alias: {
          "./Worker?worker": path.resolve("./src/worker/Worker.ts"), // Needed for service worker to resolve the web worker correctly
          "@lib": path.resolve("./src/lib"),
          events: "events", // Needed for xml2js
          stream: "stream-browserify", // Needed for xml2js
        },
      },
      root: "src",
      server: {
        fs: {
          allow: [
            searchForWorkspaceRoot(process.cwd()),
            path.resolve("../shared/web/src"),
          ],
        },
        host: true,
        port: 1080,
      },
    };
  });
};
