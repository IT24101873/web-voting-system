// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    headers: {
      // allow admin app to frame this page in dev
      "Content-Security-Policy":
        "frame-ancestors http://localhost:5174 http://127.0.0.1:5174 http://localhost:5176 http://127.0.0.1:5176 'self'"
      // do NOT set X-Frame-Options: DENY/SAMEORIGIN; leave it out in dev
    },
  },
});
