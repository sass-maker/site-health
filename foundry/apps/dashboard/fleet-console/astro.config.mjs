import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  build: {
    inlineStylesheets: "always"
  },
  vite: {
    server: {
      proxy: {
        "/api/founder": {
          target: "http://127.0.0.1:4187",
          rewrite: (path) => path.replace(/^\/api\/founder/, "")
        }
      }
    },
    preview: {
      allowedHosts: ["fleet.sassmaker.com"]
    }
  }
});
