import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import Pool from './pages/pool';
import Trade from './pages/trade';
import PoolV2 from './pages/poolV2';
import TradeV2 from './pages/tradeV2';
import TradeV3 from './pages/tradeV3';

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
    path: '/pool2',
    element: <PoolV2 />,
  },
  {
    path: '/trade2',
    element: <TradeV2 />,
  },
  {
    path: '/trade3',
    element: <TradeV3 />,
  },
]);

export { router };
