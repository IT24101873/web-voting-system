import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5177, strictPort: true }, // ← runs separate from admin (5174)
});
