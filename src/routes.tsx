import React from "react";
import { createBrowserRouter } from "react-router-dom";

import Demo from "./pages/demo";
import Pool from "./pages/pool";
import Trade from "./pages/trade";
import MarketSelectDemo from "./pages/demo/market-select";
import WalletPopoverDemo from "./pages/demo/wallet-popover";
import AssetPopoverDemo from "./pages/demo/asset-popover";
import PoolPanelDemo from "./pages/demo/pool-panel";
import TradePanelDemo from "./pages/demo/trade-panel";
import WagmiTest from "./components/WagmiTest";
import PositionsPanelDemo from "./pages/demo/positions-panel";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <h1 className="text-3xl font-bold underline">MAIN</h1>
      </div>
    ),
  },
  {
    path: "/hello",
    element: (
      <div>
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
      </div>
    ),
  },
  {
    path: "/wagmi",
    element: (
      <div>
        <h1 className="text-3xl font-bold underline">Wagmi Test</h1>
        <WagmiTest />
      </div>
    ),
  },
  {
    path: "/demo",
    element: <Demo />,
  },
  {
    path: "/pool",
    element: <Pool />,
  },
  {
    path: "/trade",
    element: <Trade />,
  },
  {
    path: "/demo/market-select",
    element: <MarketSelectDemo />,
  },
  {
    path: "/demo/wallet-popover",
    element: <WalletPopoverDemo />,
  },
  {
    path: "/demo/asset-popover",
    element: <AssetPopoverDemo />,
  },
  {
    path: "/demo/pool-panel",
    element: <PoolPanelDemo />,
  },
  {
    path: "/demo/trade-panel",
    element: <TradePanelDemo />,
  },
  {
    path: "/demo/positions-panel",
    element: <PositionsPanelDemo />,
  },
]);

export { router };
