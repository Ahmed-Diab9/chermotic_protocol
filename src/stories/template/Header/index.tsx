import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import LogoSimple from '~/assets/icons/LogoSimple';
import { TooltipAlert } from '~/stories/atom/TooltipAlert';
import { Account } from '~/typings/account';
import { trimAddress } from '~/utils/address';
import { ThemeToggle } from '~/stories/atom/ThemeToggle';
import { Avatar } from '~/stories/atom/Avatar';
import { WalletPopover } from '~/stories/container/WalletPopover';
import arbitrumIcon from '/src/assets/images/arbitrum.svg';
import useChain from '~/hooks/useChain';

interface HeaderProps {
  account?: Account;
  isConnected?: boolean;
  isWrongChain?: boolean;
  onConnect?: () => unknown;
}

export const Header = (props: HeaderProps) => {
  const { account, isConnected, isWrongChain, onConnect } = props;
  const location = useLocation();

  return (
    // <header className="sticky top-0 Header">
    <header className="Header">
      <div className="h-[70px] bg-paper-lightest px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6 text-lg">
          <Link to="/" className="mr-4 font-bold" title="Chromatic">
            <LogoSimple className="text-primary h-9" />
          </Link>
          <Link
            to="/trade"
            className={`border-b-2 leading-none pb-2 px-[2px] mt-2 text-primary font-semibold ${
              location.pathname === '/trade' ? '!border-primary' : '!border-transparent'
            }`}
          >
            Trade
          </Link>
          <Link
            to="/pool"
            className={`border-b-2 leading-none pb-2 px-[2px] mt-2 text-primary font-semibold ${
              location.pathname === '/pool' ? '!border-primary' : '!border-transparent'
            }`}
          >
            Pools
          </Link>
          {/* dropdown */}
        </div>
        <div className="flex">
          <div className="mr-4">
            <ThemeToggle />
          </div>
          {isConnected && !isWrongChain && <WalletPopover />}
          {isConnected && isWrongChain && (
            <ChainSwitch
              width={175}
              label={account?.walletAddress && trimAddress(account?.walletAddress, 7, 5)}
            />
          )}
          {!isConnected && (
            <button onClick={onConnect} title="connect" className="btn btn-wallet min-w-[148px]">
              <Avatar src={arbitrumIcon} className="avatar" />
              <p className="w-full pr-4 text-lg font-semibold text-center">Connect</p>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

interface ChainSwitchProps {
  width: number;
  label?: string;
  children?: JSX.Element;
}

const ChainSwitch = (props: ChainSwitchProps) => {
  const { label, width, children } = props;
  const { switchChain } = useChain();
  return (
    <button
      onClick={switchChain}
      title="change network"
      className={`tooltip-change-network min-w-[${width}px] btn-wallet`}
    >
      <Avatar
        svg={<ExclamationTriangleIcon />}
        className="text-primary avatar !bg-paper"
        fontSize="sm"
        fontWeight="normal"
        gap="3"
        label={label}
      />
      {children}
      <TooltipAlert
        label="change-network"
        tip="Change Network"
        place="bottom"
        css="outline"
        className=""
      />
    </button>
  );
};
