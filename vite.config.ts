import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // eslint(),
    tsconfigPaths(),
  ],
  define: {
    "process.env": process.env,
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8545"
    },
  }
});
