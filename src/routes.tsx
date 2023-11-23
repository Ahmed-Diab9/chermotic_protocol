import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

const Pool = lazy(() => import('./pages/pool'));
const PoolV2 = lazy(() => import('./pages/poolV2'));
const PoolV3 = lazy(() => import('./pages/poolV3'));
const Trade = lazy(() => import('./pages/trade'));
const TradeV2 = lazy(() => import('./pages/tradeV2'));
const TradeV3 = lazy(() => import('./pages/tradeV3'));
const Airdrop = lazy(() => import('./pages/airdrop'));
const Faucet = lazy(() => import('./pages/faucet'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={'/trade'} />,
  },
  {
    path: '/pool1',
    element: <Pool />,
  },
  {
    path: '/pool2',
    element: <PoolV2 />,
  },
  {
    path: '/pool',
    element: <PoolV3 />,
  },

  {
    path: '/trade1',
    element: <Trade />,
  },
  {
    path: '/trade2',
    element: <TradeV2 />,
  },
  {
    path: '/trade',
    element: <TradeV3 />,
  },

  {
    path: '/airdrop',
    element: <Airdrop />,
  },
  {
    path: '/faucet',
    element: <Faucet />,
  },
  {
    path: '/airdrop',
    element: <Airdrop />,
  },
]);

export { router };
