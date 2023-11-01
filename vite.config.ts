import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import topLevelAwait from 'vite-plugin-top-level-await';

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
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: (i) => `__tla_${i}`,
    }),
  ],
  define: {
    'process.env': process.env,
  },
});
