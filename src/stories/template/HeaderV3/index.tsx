import { Link } from 'react-router-dom';
import { WaterdropIcon } from '~/assets/icons/Icon';
import { ChromaticSimpleLogo } from '~/assets/icons/Logo';
import { Button } from '~/stories/atom/Button';
import { ThemeToggle } from '~/stories/atom/ThemeToggle';
import { AccountPopoverV3 } from '~/stories/molecule/AccountPopoverV3';
import { HeaderMenuPopover } from '~/stories/molecule/HeaderMenuPopover';
import WalletPopoverV3 from '~/stories/molecule/WalletPopoverV3';
import './style.css';

import { useHeaderV3 } from './hooks';

interface HeaderV3Props {
  hideMenu?: boolean;
}

export const HeaderV3 = (props: HeaderV3Props) => {
  const { hideMenu } = props;

  const { hasAccount, isActiveLink, walletPopoverProps, _isConnected } = useHeaderV3();

  const links = [
    { to: 'trade', className: '' },
    { to: 'pools', className: '' },
    { to: 'airdrop', className: '' },
  ];

  return (
    <header className="HeaderV3">
      <div className="h-[70px] px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/" className="mr-4" title="Chromatic Protocol" rel="noopener noreferrer">
            <ChromaticSimpleLogo className="text-primary h-9" />
          </a>
          {!hideMenu && (
            <>
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
            </>
          )}
        </div>

        <div className="flex items-center gap-0">
          {!hideMenu && _isConnected && (
            <Button
              label="faucet"
              href={`/faucet`}
              css="active-translucent"
              className="capitalize !gap-1 !h-[40px]"
              size="lg"
              iconRight={<WaterdropIcon className="!w-3 !h-3" />}
            />
          )}
          {hasAccount && (
            <div className="ml-3">
              <AccountPopoverV3 />
            </div>
          )}
          <div className="ml-5">
            <WalletPopoverV3 {...walletPopoverProps} />
          </div>
          <ThemeToggle showToggle={false} />
        </div>
      </div>
    </header>
  );
};
