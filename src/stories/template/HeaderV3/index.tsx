import { Link } from 'react-router-dom';

import LogoSimple from '~/assets/icons/LogoSimple';

import { ThemeToggle } from '~/stories/atom/ThemeToggle';
import { WalletPopoverV3 } from '~/stories/molecule/WalletPopoverV3';
import './style.css';

import { useHeaderV3 } from './hooks';
import { AccountPopoverV3 } from '~/stories/molecule/AccountPopoverV3';

interface HeaderV3Props {
  hasAccount?: boolean;
}

export const HeaderV3 = (props: HeaderV3Props) => {
  const { hasAccount } = props;
  const { isActiveLink, walletPopoverProps } = useHeaderV3();

  const links = [
    { to: 'trade', text: 'Trade', className: '' },
    { to: 'pool', text: 'Pools', className: '' },
    { to: 'trade3', text: 'Trade3', className: 'text-primary-light' },
    { to: 'pool3', text: 'Pools3', className: 'text-primary-light' },
    { to: 'airdrop', text: 'Airdrop', className: '' },
  ];

  return (
    <header className="HeaderV3">
      <div className="h-[70px] px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6 text-lg">
          <a
            href="https://chromatic.finance/"
            className="mr-4"
            title="Chromatic"
            target="_blank"
            rel="noopener noreferrer"
          >
            {' '}
            <LogoSimple className="text-primary h-9" />
          </a>
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
        <div className="flex gap-5">
          {hasAccount && <AccountPopoverV3 />}
          <div className="hidden">
            <ThemeToggle />
          </div>
          <WalletPopoverV3 {...walletPopoverProps} />
        </div>
      </div>
    </header>
  );
};
