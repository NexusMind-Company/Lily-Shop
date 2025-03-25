import { defineConfig } from "vite";

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 500, // (Optional) Adjust warning limit
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor"; // Separate vendor dependencies
          }
        },
      },
    },
  },
});
