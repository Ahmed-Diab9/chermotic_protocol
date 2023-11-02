import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { PluginOption, defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import tsconfigPaths from 'vite-tsconfig-paths';

const plugins: PluginOption[] = [
  react(),
  // eslint(),
  tsconfigPaths(),
  // Put the Sentry vite plugin after all other plugins
  sentryVitePlugin({
    org: 'chromatic-protocol',
    project: 'chromatic-frontend',
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }),
];

if (!process.env.STORYBOOK) {
  plugins.push(
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: (i) => `__tla_${i}`,
    })
  );
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true, // Source map generation must be turned on
  },
  plugins,
  define: {
    'process.env': process.env,
  },
});
