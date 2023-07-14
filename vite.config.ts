import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import tsconfigPaths from 'vite-tsconfig-paths';
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true, // Source map generation must be turned on
  },
  plugins: [
    react(),
    // eslint(),
    tsconfigPaths(),
    // Put the Sentry vite plugin after all other plugins
    sentryVitePlugin({
      org: 'chromatic-protocol',
      project: 'chromatic-frontend',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  define: {
    'process.env': process.env,
  },
  server: {
    // hmr: false,
    proxy: {
      '/api': 'http://127.0.0.1:8545',
    },
  },
});
