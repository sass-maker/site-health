import { defineConfig } from "astro/config";

const founderControlDevUrl = process.env.FOUNDER_CONTROL_DEV_URL ?? "http://127.0.0.1:4187";

export default defineConfig({
  output: "static",
  build: {
    inlineStylesheets: "always"
  },
  vite: {
    server: {
      proxy: {
        "/api/founder": {
          target: founderControlDevUrl,
          rewrite: (path) => path.replace(/^\/api\/founder/, "")
        }
      }
    },
    preview: {
      allowedHosts: ["fleet.sassmaker.com"]
    }
  }
});
