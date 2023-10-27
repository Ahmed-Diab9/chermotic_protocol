import { Navigate, createBrowserRouter } from 'react-router-dom';
import Airdrop from './pages/airdrop';
import { Faucet } from './pages/faucet';
import Pool from './pages/pool';
import PoolV2 from './pages/poolV2';
import PoolV3 from './pages/poolV3';
import Trade from './pages/trade';
import TradeV2 from './pages/tradeV2';
import TradeV3 from './pages/tradeV3';
import Airdrop from './pages/airdrop';

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
