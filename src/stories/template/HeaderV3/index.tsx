import { ChromaticSimpleLogo } from '~/assets/icons/Logo';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '~/stories/atom/ThemeToggle';
import { WalletPopoverV3 } from '~/stories/molecule/WalletPopoverV3';
import { HeaderMenuPopover } from '~/stories/molecule/HeaderMenuPopover';
import { AccountPopoverV3 } from '~/stories/molecule/AccountPopoverV3';
import './style.css';

import { useHeaderV3 } from './hooks';

interface HeaderV3Props {
  hasAccount?: boolean;
}

export const HeaderV3 = (props: HeaderV3Props) => {
  const { hasAccount } = props;
  const { isActiveLink, walletPopoverProps } = useHeaderV3();

  const links = [
    { to: 'trade', className: '' },
    { to: 'pool', className: '' },
    { to: 'airdrop', className: '' },
    { to: 'faucet', className: '' },
  ];

  return (
    <header className="HeaderV3">
      <div className="h-[70px] px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a
            href="https://chromatic.finance/"
            className="mr-4"
            title="Chromatic"
            target="_blank"
            rel="noopener noreferrer"
          >
            {' '}
            <ChromaticSimpleLogo className="text-primary h-9" />
          </a>
          {links.map((link) => (
            <Link
              key={link.to}
              to={`/${link.to}`}
              className={`link ${link.className} ${
                isActiveLink(link.to) ? '!border-primary' : '!border-transparent'
              }`}
            >
              {link.to}
            </Link>
          ))}
          <HeaderMenuPopover />
        </div>
        <div className="flex items-center gap-5">
          {/* <Link
            // key="faucet"
            to={`/faucet`}
            className={`link  ${
              isActiveLink('faucet') ? '!border-primary' : '!border-transparent'
            }`}
          >
            faucet
          </Link> */}
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
