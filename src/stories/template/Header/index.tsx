import { Link } from 'react-router-dom';

import LogoSimple from '~/assets/icons/LogoSimple';

import { ThemeToggle } from '~/stories/atom/ThemeToggle';
import { WalletPopover } from '~/stories/molecule/WalletPopover';
import './style.css';

import { useHeader } from './hooks';

export function Header() {
  const { isActiveLink, walletPopoverProps } = useHeader();

  const links = [
    { to: 'trade', text: 'Trade', className: '' },
    { to: 'pool', text: 'Pools', className: '' },
    { to: 'trade3', text: 'Trade3', className: 'text-primary-light' },
    { to: 'pool3', text: 'Pools3', className: 'text-primary-light' },
    { to: 'airdrop', text: 'Airdrop', className: '' },
  ];

  return (
    <header className="Header">
      <div className="h-[70px] px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6 text-lg">
          <Link to="/" className="mr-4 font-bold" title="Chromatic">
            <LogoSimple className="text-primary h-9" />
          </Link>
          {links.map((link) => (
            <Link
              key={link.to}
              to={`/${link.to}`}
              className={`link ${link.className} ${
                isActiveLink(link.to) ? '!border-primary' : '!border-transparent'
              }`}
            >
              {link.text}
            </Link>
          ))}
        </div>
        <div className="flex">
          <div className="hidden mr-4">
            <ThemeToggle />
          </div>
          <WalletPopover {...walletPopoverProps} />
        </div>
      </div>
    </header>
  );
}
