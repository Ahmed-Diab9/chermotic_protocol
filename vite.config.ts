import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

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
});
