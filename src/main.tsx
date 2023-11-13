import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

Sentry.init({
  dsn: 'https://1ba67d712ee3486f9ac2517ee444e7af@o4505526071721984.ingest.sentry.io/4505526103572480',
  denyUrls: [/http:\/\/localhost/i],
});

if (process.env.NODE_ENV === 'development') {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest(request, print) {
        return;
      },
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
