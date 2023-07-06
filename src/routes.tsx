import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import Pool from './pages/pool';
import Trade from './pages/trade';
import WagmiTest from './components/WagmiTest';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={'/trade'} />,
  },
  {
    path: '/hello',
    element: (
      <div>
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
      </div>
    ),
  },
  {
    path: '/wagmi',
    element: (
      <div>
        <h1 className="text-3xl font-bold underline">Wagmi Test</h1>
        <WagmiTest />
      </div>
    ),
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
