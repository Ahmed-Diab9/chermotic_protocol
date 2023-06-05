import { Avatar } from "../../atom/Avatar";
import { Button } from "../../atom/Button";
import LogoSimple from "~/assets/icons/LogoSimple";
import { WalletPopover } from "../../molecule/WalletPopover";
import { Market, Price, Token } from "~/typings/market";
import { Account } from "~/typings/account";
import { BigNumber } from "ethers";
import { LiquidityPoolSummary } from "~/typings/pools";
import { Link } from "react-router-dom";

interface HeaderProps {
  account?: Account;
  tokens?: Token[];
  markets?: Market[];
  balances?: Record<string, BigNumber>;
  priceFeed?: Record<string, Price>;
  pools?: LiquidityPoolSummary[];
  onConnect?: () => unknown;
  onDisconnect?: () => unknown;
  onCreateAccount?: () => void;
  onWalletCopy?: (text: string) => unknown;
  onUsumCopy?: (text: string) => unknown;
}

export const Header = ({
  account,
  tokens,
  markets,
  balances,
  priceFeed,
  pools,
  onConnect,
  onDisconnect,
  onCreateAccount,
  onWalletCopy,
  onUsumCopy,
}: HeaderProps) => (
  <header>
    <div className="h-[100px] px-10 py-5 flex items-center justify-between">
      <div className="flex items-center gap-12 text-lg">
        <Link to="/" className="mr-4 font-bold" title="Chromatic">
          <LogoSimple />
        </Link>
        <Link to="/trade">Trade</Link>
        <Link to="/pool">Pool</Link>
        {/* dropdown */}
      </div>
      <div>
        {account ? (
          <>
            <WalletPopover
              account={account}
              tokens={tokens}
              markets={markets}
              balances={balances}
              priceFeed={priceFeed}
              pools={pools}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              onCreateAccount={onCreateAccount}
              onWalletCopy={onWalletCopy}
              onUsumCopy={onUsumCopy}
            />
          </>
        ) : (
          <>
            <button
              onClick={onConnect}
              title="connect"
              className="p-[2px] pr-5 border rounded-full bg-black border-grayL text-white min-w-[175px]"
            >
              <Avatar
                src="/src/assets/images/arbitrum.svg"
                label="Connect"
                className="!w-[44px] !h-[44px]"
                fontSize="lg"
                fontWeight="normal"
                gap="5"
              />
            </button>
          </>
        )}
      </div>
    </div>
  </header>
);
