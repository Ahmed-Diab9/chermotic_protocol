import { Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { ChromaticLayout, GradientLayout } from './layouts';

const PoolV3 = lazy(() => import('./pages/poolV3'));
const TradeV3 = lazy(() => import('./pages/tradeV3'));
const Airdrop = lazy(() => import('./pages/airdrop'));
const Faucet = lazy(() => import('./pages/faucet'));
const Referral = lazy(() => import('./pages/referral'));

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
        path: '/referral',
        element: (
          <Suspense>
            <Referral />
          </Suspense>
        ),
      },
      {
        path: '/',
        element: <GradientLayout />,
        children: [
          {
            path: '/pools',
            element: (
              <Suspense>
                <PoolV3 />
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
          // Navigate pool to pools
          {
            path: '/pool',
            element: <Navigate to={'/pools'} />,
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
