import './index.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";

import App from './App';

Sentry.init({
  dsn: "https://c6771fd0a57d40da96c846470db59c6e@o4505526071721984.ingest.sentry.io/4505526075129856",
});

createRoot(document.getElementById('root')!).render(<App />);
