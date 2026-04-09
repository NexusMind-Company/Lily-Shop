import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
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
    host: "0.0.0.0", // This makes the server accessible from outside the container
    port: 5173,
     historyApiFallback: true,
    headers: {
      "Cache-Control": "public, max-age=31536000",
    },
    hmr: {
      host: "localhost",
      port: 5173,
    },
  },
});
