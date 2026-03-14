import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // ── Switch target as needed ──────────────────────────────────────
        target: "http://localhost:5000",                            // local dev
        // target: "https://ecommers-textile-backend.onrender.com", // Render backend
        changeOrigin: true,
      },
    },
  },
});
