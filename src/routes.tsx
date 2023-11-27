import { Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { ChromaticLayout, GradientLayout } from './layouts';

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
    element: <ChromaticLayout />,
    children: [
      {
        path: '/airdrop',
        element: (
          <Suspense>
            <Airdrop />
          </Suspense>
        ),
      },
      {
        path: '/',
        element: <GradientLayout />,
        children: [
          {
            path: '/pool1',
            element: (
              <Suspense>
                <Pool />
              </Suspense>
            ),
          },
          {
            path: '/pool2',
            element: (
              <Suspense>
                <PoolV2 />
              </Suspense>
            ),
          },
          {
            path: '/pool',
            element: (
              <Suspense>
                <PoolV3 />
              </Suspense>
            ),
          },

          {
            path: '/trade1',
            element: (
              <Suspense>
                <Trade />
              </Suspense>
            ),
          },
          {
            path: '/trade2',
            element: (
              <Suspense>
                <TradeV2 />
              </Suspense>
            ),
          },
          {
            path: '/trade',
            element: (
              <Suspense>
                <TradeV3 />
              </Suspense>
            ),
          },
          {
            path: '/',
            element: <Navigate to={'/trade'} />,
          },
        ],
      },
    ],
  },
  {
    path: '/faucet',
    element: (
      <Suspense>
        <Faucet />
      </Suspense>
    ),
  },
]);

export { router };
