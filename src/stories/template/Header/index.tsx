import { Link } from 'react-router-dom';

import LogoSimple from '~/assets/icons/LogoSimple';

import { ThemeToggle } from '~/stories/atom/ThemeToggle';
import { WalletPopover } from '~/stories/molecule/WalletPopover';
import './style.css';

import { useHeader } from './hooks';

export function Header() {
  const { isActiveLink, walletPopoverProps } = useHeader();

  return (
    <header className="Header">
      <div className="h-[64px] px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6 text-lg">
          <Link to="/" className="mr-4 font-bold" title="Chromatic">
            <LogoSimple className="text-primary h-9" />
          </Link>
          <Link
            to="/trade"
            className={`link ${isActiveLink('trade') ? '!border-primary' : '!border-transparent'}`}
          >
            Trade
          </Link>
          <Link
            to="/pool"
            className={`link ${isActiveLink('pool') ? '!border-primary' : '!border-transparent'}`}
          >
            Pools
          </Link>
          <Link
            to="/trade2"
            className={`link text-primary-light ${
              isActiveLink('trade2') ? '!border-primary-light' : '!border-transparent'
            }`}
          >
            Trade2
          </Link>
          <Link
            to="/pool2"
            className={`link text-primary-light ${
              isActiveLink('pool2') ? '!border-primary-light' : '!border-transparent'
            }`}
          >
            Pools2
          </Link>
          <Link
            to="/trade3"
            className={`link text-primary-light ${
              isActiveLink('trade3') ? '!border-primary-light' : '!border-transparent'
            }`}
          >
            T3
          </Link>
          {/* <Link
            to="/pool2"
            className={`link text-primary-light ${
              isActiveLink('pool3') ? '!border-primary-light' : '!border-transparent'
            }`}
          >
            P3
          </Link> */}
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
