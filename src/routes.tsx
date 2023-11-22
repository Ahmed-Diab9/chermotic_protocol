import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import Airdrop from './pages/airdrop';
import Faucet from './pages/faucet';
import Pool from './pages/pool';
import PoolV2 from './pages/poolV2';
import Trade from './pages/trade';
import TradeV2 from './pages/tradeV2';

const PoolV3 = lazy(() => import('./pages/poolV3'));
const TradeV3 = lazy(() => import('./pages/tradeV3'));

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
