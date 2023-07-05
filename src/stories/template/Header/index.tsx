import { BigNumber } from 'ethers';
import { Link, useLocation } from 'react-router-dom';
import LogoSimple from '~/assets/icons/LogoSimple';
import { Account } from '~/typings/account';
import { Market, Price, Token } from '~/typings/market';
import { LiquidityPoolSummary } from '~/typings/pools';
import { isValid } from '../../../utils/valid';
import { Avatar } from '../../atom/Avatar';
import { WalletPopover } from '../../molecule/WalletPopover';

import arbitrumIcon from '/src/assets/images/arbitrum.svg';

interface HeaderProps {
  account?: Account;
  tokens?: Token[];
  markets?: Market[];
  balances?: Record<string, BigNumber>;
  priceFeed?: Record<string, Price>;
  pools?: LiquidityPoolSummary[];
  isBalanceLoading?: boolean;
  onConnect?: () => unknown;
  onDisconnect?: () => unknown;
  onCreateAccount?: () => void;
  onWalletCopy?: (text: string) => unknown;
  onUsumCopy?: (text: string) => unknown;
}

export const Header = (props: HeaderProps) => {
  const {
    account,
    tokens,
    markets,
    balances,
    priceFeed,
    pools,
    isBalanceLoading,
    onConnect,
    onDisconnect,
    onCreateAccount,
    onWalletCopy,
    onUsumCopy,
  } = props;
  const location = useLocation();

  return (
    // <header className="sticky top-0 Header">
    <header className="Header">
      <div className="h-[70px]  px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6 text-lg">
          <Link to="/" className="mr-4 font-bold" title="Chromatic">
            <LogoSimple className="h-9" />
          </Link>
          <Link
            to="/trade"
            className={`border-b-2 leading-none pb-2 px-[2px] mt-2 ${
              location.pathname === '/trade' ? 'border-black' : 'border-transparent'
            }`}
          >
            Trade
          </Link>
          <Link
            to="/pool"
            className={`border-b-2 leading-none pb-2 px-[2px] mt-2 ${
              location.pathname === '/pool' ? 'border-black' : 'border-transparent'
            }`}
          >
            Pools
          </Link>
          {/* dropdown */}
        </div>
        <div>
          {isValid(account?.walletAddress) ? (
            <>
              <WalletPopover
                account={account}
                tokens={tokens}
                markets={markets}
                balances={balances}
                priceFeed={priceFeed}
                pools={pools}
                isLoading={isBalanceLoading}
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
                  src={arbitrumIcon}
                  label="Connect"
                  className="!w-[36px] !h-[36px]"
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
};
