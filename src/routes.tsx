import { Navigate, createBrowserRouter } from 'react-router-dom';
import { Faucet } from './pages/faucet';
import Pool from './pages/pool';
import PoolV2 from './pages/poolV2';
import PoolV3 from './pages/poolV3';
import Trade from './pages/trade';
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
    path: '/pool2',
    element: <PoolV2 />,
  },
  {
    path: '/pool3',
    element: <PoolV3 />,
  },

  {
    path: '/trade',
    element: <Trade />,
  },
  {
    path: '/trade2',
    element: <TradeV2 />,
  },
  {
    path: '/trade3',
    element: <TradeV3 />,
  },
  {
    path: '/faucet',
    element: <Faucet />,
  },
]);

export { router };
