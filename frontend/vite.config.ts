import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      "/v1": {
        target: process.env.VITE_CLOUDCAMPUS_API_BASE_URL || "http://localhost:18080",
        changeOrigin: true
      }
    }
  }
});
