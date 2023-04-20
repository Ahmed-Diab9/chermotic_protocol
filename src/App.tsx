import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { createClient, configureChains, WagmiConfig } from "wagmi";
import { hardhat, arbitrum } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ethers } from "ethers";

const web3Provider = new ethers.providers.Web3Provider(
  window.ethereum as never
);

const { chains, webSocketProvider } = configureChains(
  [hardhat, arbitrum],
  [publicProvider()]
);
const client = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })] as [InjectedConnector],
  provider: web3Provider,
  webSocketProvider: webSocketProvider,
});

function App() {
  return (
    <WagmiConfig client={client}>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </WagmiConfig>
  );
}

export default App;
