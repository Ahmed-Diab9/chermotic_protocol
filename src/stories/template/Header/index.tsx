import { Link } from 'react-router-dom';

import LogoSimple from '~/assets/icons/LogoSimple';

import { ThemeToggle } from '~/stories/atom/ThemeToggle';
import { WalletPopover } from '~/stories/molecule/WalletPopover';

import { useHeader } from './hooks';

export function Header() {
  const { isActiveLink, walletPopoverProps } = useHeader();

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
          <WalletPopover {...walletPopoverProps} />
        </div>
      </div>
    </header>
  );
}
