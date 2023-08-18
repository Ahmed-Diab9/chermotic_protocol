import { Link } from 'react-router-dom';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import LogoSimple from '~/assets/icons/LogoSimple';
import arbitrumIcon from '~/assets/images/arbitrum.svg';

import { Avatar } from '~/stories/atom/Avatar';
import { ThemeToggle } from '~/stories/atom/ThemeToggle';
import { TooltipAlert } from '~/stories/atom/TooltipAlert';
import { WalletPopover } from '~/stories/container/WalletPopover';

import { useHeader } from './hooks';

export function Header() {
  const {
    isActiveLink,

    isConnected,
    isWrongChain,
    isDisconnected,

    walletAddress,

    onConnect,
    onSwitchChain,
  } = useHeader();

  return (
    <header className="Header">
      <div className="h-[70px] bg-paper-lightest px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6 text-lg">
          <Link to="/" className="mr-4 font-bold" title="Chromatic">
            <LogoSimple className="text-primary h-9" />
          </Link>
          <Link
            to="/trade"
            className={`border-b-2 leading-none pb-2 px-[2px] mt-2 text-primary font-semibold ${
              isActiveLink('trade') ? '!border-primary' : '!border-transparent'
            }`}
          >
            Trade
          </Link>
          <Link
            to="/pool"
            className={`border-b-2 leading-none pb-2 px-[2px] mt-2 text-primary font-semibold ${
              isActiveLink('pool') ? '!border-primary' : '!border-transparent'
            }`}
          >
            Pools
          </Link>
        </div>
        <div className="flex">
          <div className="mr-4">
            <ThemeToggle />
          </div>
          {isConnected && <WalletPopover />}
          {/* TODO: MOVE INTO WALLET POPOVER */}
          {isWrongChain && (
            <ChainSwitch width={175} onSwitchChain={onSwitchChain} address={walletAddress} />
          )}
          {isDisconnected && <Connect width={148} onConnect={onConnect} />}
        </div>
      </div>
    </header>
  );
}

interface ConnectProps {
  width: number;
  onConnect: () => unknown;
}

const Connect = ({ width, onConnect }: ConnectProps) => {
  return (
    <button onClick={onConnect} title="connect" className={`btn btn-wallet min-w-[${width}px]`}>
      <Avatar src={arbitrumIcon} className="avatar" />
      <p className="w-full pr-4 text-lg font-semibold text-center">Connect</p>
    </button>
  );
};

interface ChainSwitchProps {
  width: number;
  address: string;
  onSwitchChain: () => unknown;
}

const ChainSwitch = ({ address, width, onSwitchChain }: ChainSwitchProps) => {
  return (
    <button
      onClick={onSwitchChain}
      title="change network"
      className={`tooltip-change-network min-w-[${width}px] btn-wallet`}
    >
      <Avatar
        svg={<ExclamationTriangleIcon />}
        className="text-primary avatar !bg-paper"
        fontSize="sm"
        fontWeight="normal"
        gap="3"
        label={address}
      />
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
