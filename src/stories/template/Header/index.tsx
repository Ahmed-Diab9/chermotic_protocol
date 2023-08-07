import { Link, useLocation } from 'react-router-dom';
import LogoSimple from '~/assets/icons/LogoSimple';
import { Account } from '~/typings/account';
import { isValid } from '../../../utils/valid';
import { Avatar } from '../../atom/Avatar';
import { WalletPopover } from '../../container/WalletPopover';

import arbitrumIcon from '/src/assets/images/arbitrum.svg';

interface HeaderProps {
  account?: Account;
  onConnect?: () => unknown;
}

export const Header = (props: HeaderProps) => {
  const { account, onConnect } = props;
  const location = useLocation();

  return (
    // <header className="sticky top-0 Header">
    <header className="Header">
      <div className="h-[70px] bg-grayLbg dark:bg-black1 px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6 text-lg">
          <Link to="/" className="mr-4 font-bold" title="Chromatic">
            <LogoSimple className="text-black1 dark:text-white1 h-9" />
          </Link>
          <Link
            to="/trade"
            className={`border-b-2 leading-none pb-2 px-[2px] mt-2 text-black1 dark:text-white1 ${
              location.pathname === '/trade'
                ? 'border-black1 dark:border-white'
                : '!border-transparent'
            }`}
          >
            Trade
          </Link>
          <Link
            to="/pool"
            className={`border-b-2 leading-none pb-2 px-[2px] mt-2 text-black1 dark:text-white1 ${
              location.pathname === '/pool'
                ? 'border-black1 dark:border-white'
                : '!border-transparent'
            }`}
          >
            Pools
          </Link>
          {/* dropdown */}
        </div>
        <div>
          {isValid(account?.walletAddress) ? (
            <>
              <WalletPopover />
              {/* todo: Wrong Network */}
              {/* when button clicked, wallet popup(change network) is open. */}
              {/* <button
                // onClick={}
                title="change network"
                className="tooltip-change-network min-w-[175px] btn-wallet"
              >
                <Avatar
                  // label={account?.walletAddress && trimAddress(account?.walletAddress, 7, 5)}
                  label="0x00000...00000"
                  svg={<ExclamationTriangleIcon />}
                  className="text-black1 avatar"
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
              </button> */}
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
