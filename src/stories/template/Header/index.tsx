import { Link, useLocation } from 'react-router-dom';
import LogoSimple from '~/assets/icons/LogoSimple';
import { Account } from '~/typings/account';
import { Market, Price, Token } from '~/typings/market';
import { LiquidityPoolSummary } from '~/typings/pools';
import { isValid } from '../../../utils/valid';
import { Avatar } from '../../atom/Avatar';
import { WalletPopover } from '../../molecule/WalletPopover';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { TooltipAlert } from '~/stories/atom/TooltipAlert';

import arbitrumIcon from '/src/assets/images/arbitrum.svg';
import { Address } from 'wagmi';

interface HeaderProps {
  account?: Account;
  tokens?: Token[];
  markets?: Market[];
  balances?: Record<Address, bigint>;
  priceFeed?: Record<Address, Price>;
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
      <div className="h-[70px] bg-grayBG px-10 py-5 flex items-center justify-between">
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
              {/* todo: Wrong Network */}
              {/* when button clicked, wallet popup(change network) is open. */}
              <button
                // onClick={}
                title="change network"
                className="tooltip-change-network min-w-[175px] btn-wallet"
              >
                <Avatar
                  // label={account?.walletAddress && trimAddress(account?.walletAddress, 7, 5)}
                  label="0x00000...00000"
                  svg={<ExclamationTriangleIcon />}
                  className="text-black avatar"
                  fontSize="sm"
                  fontWeight="normal"
                  gap="3"
                />
                <TooltipAlert
                  label="change-network"
                  tip="Change Network"
                  place="left"
                  css="outline"
                />
              </button>
            </>
          ) : (
            <>
              <button onClick={onConnect} title="connect" className="btn-wallet min-w-[148px]">
                <Avatar src={arbitrumIcon} className="avatar" />
                <p className="w-full pr-4 text-lg font-semibold text-center">Connect</p>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
