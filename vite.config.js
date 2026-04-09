import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("react-router")) {
            return "router";
          }

          if (
            id.includes("@reduxjs/toolkit") ||
            id.includes("react-redux") ||
            id.includes("/redux/")
          ) {
            return "redux";
          }

          if (id.includes("@tanstack/react-query")) {
            return "react-query";
          }

          if (id.includes("framer-motion")) {
            return "motion";
          }

          if (id.includes("lucide-react") || id.includes("react-icons")) {
            return "icons";
          }

          if (id.includes("swiper")) {
            return "swiper";
          }

          if (
            id.includes("react-hook-form") ||
            id.includes("react-datepicker") ||
            id.includes("react-phone-number-input")
          ) {
            return "forms";
          }

          if (
            id.includes("emoji-picker-react") ||
            id.includes("react-easy-crop")
          ) {
            return "media-tools";
          }

          if (
            id.includes("axios") ||
            id.includes("react-hot-toast") ||
            id.includes("react-helmet-async") ||
            id.includes("sonner") ||
            id.includes("react-lazyload") ||
            id.includes("react-confetti")
          ) {
            return "app-utils";
          }

          return "vendor";
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
