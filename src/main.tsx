import './index.css';

import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';

import App from './App';

Sentry.init({
  dsn: 'https://1ba67d712ee3486f9ac2517ee444e7af@o4505526071721984.ingest.sentry.io/4505526103572480',
  denyUrls: [/http:\/\/localhost/i],
});

createRoot(document.getElementById('root')!).render(<App />);
