import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"./Worker?worker": path.resolve("./src/worker/Worker.ts"), // Needed for service worker to resolve the web worker correctly
			"@lib": path.resolve("./src/lib"),
		},
	},
	test: {
		globalSetup: [
			"src/lib/testing/globalSetup.ts",
		],
		globals: true,
		setupFiles: [
			"src/lib/testing/dom.ts",
			"src/lib/testing/mocks.ts",
			"src/lib/testing/helpers.ts",
		],
		watch: false,
	},
});
