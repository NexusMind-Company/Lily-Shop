import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "react-router-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    historyApiFallback: true,
    hmr: {
      host: "localhost",
      port: 5173,
    },
    // ✅ FIX: proxy all /api/* calls through Vite's server to avoid CORS
    proxy: {
      "/api": {
        target: "https://api.lilyshops.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});