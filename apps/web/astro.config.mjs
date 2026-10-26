import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const dashboardBackendDevUrl = process.env.DASHBOARD_BACKEND_DEV_URL ?? "http://127.0.0.1:4187";

export default defineConfig({
  output: "static",
  integrations: [react()],
  build: {
    inlineStylesheets: "always"
  },
  vite: {
    plugins: [tailwindcss()],
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
