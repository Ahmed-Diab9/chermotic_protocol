import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import Pool from './pages/pool';
import Trade from './pages/trade';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={'/trade'} />,
  },
  {
    path: '/pool',
    element: <Pool />,
  },
  {
    path: '/trade',
    element: <Trade />,
  },
]);

export { router };
