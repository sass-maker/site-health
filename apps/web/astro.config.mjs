import { defineConfig } from "astro/config";

const dashboardBackendDevUrl = process.env.DASHBOARD_BACKEND_DEV_URL ?? "http://127.0.0.1:4187";

export default defineConfig({
  output: "static",
  build: {
    inlineStylesheets: "always"
  },
  vite: {
    server: {
      proxy: {
        "/api/dashboard": {
          target: dashboardBackendDevUrl,
          rewrite: (path) => path.replace(/^\/api\/dashboard/, "")
        }
      }
    }
  }
});
