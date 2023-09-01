import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import Pool from './pages/pool';
import Trade from './pages/trade';
import TradeV2 from './pages/tradeV2';

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
  {
    path: '/trade2',
    element: <TradeV2 />,
  },
]);

export { router };
