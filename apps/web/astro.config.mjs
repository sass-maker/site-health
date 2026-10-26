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
    // React islands are discovered on navigation. Prebundle shared entrypoints
    // up front so the first private workspace load cannot invalidate its graph.
    optimizeDeps: {
      include: [
        "lucide-react", "@saas-maker/ui/utils",
        "@saas-maker/ui > @tanstack/react-table",
        "@saas-maker/ui > radix-ui",
        "@saas-maker/ui/components/button", "@saas-maker/ui/components/input",
        "@saas-maker/ui/components/badge", "@saas-maker/ui/components/data-table",
        "@saas-maker/ui/components/sheet",
      ],
    },
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
