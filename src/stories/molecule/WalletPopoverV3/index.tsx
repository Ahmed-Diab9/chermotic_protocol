import '~/stories/atom/Tabs/style.css';
import './style.css';

import { Fragment, Suspense, lazy } from 'react';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import arbitrumIcon from '~/assets/images/arbitrum.svg';

import { Popover, Transition } from '@headlessui/react';
import { Avatar } from '~/stories/atom/Avatar';

import { TooltipAlert } from '~/stories/atom/TooltipAlert';
import { useWalletPopoverV3 } from './hooks';

interface WalletPopoverV3Props {
  isDisconnected?: boolean;
  isWrongChain?: boolean;
}

const WalletPopoverV3Body = lazy(() => import('~/stories/molecule/WalletPopoverV3Body'));

export default function WalletPopoverV3({ isDisconnected, isWrongChain }: WalletPopoverV3Props) {
  const {
    onConnect,
    onSwitchChain,

    isLoading,
    walletAddress,
  } = useWalletPopoverV3();

  if (isDisconnected) {
    return (
      <button
        onClick={onConnect}
        title="connect"
        className={`btn btn-wallet min-w-[148px] !bg-primary`}
      >
        <Avatar src={arbitrumIcon} className="avatar" size="lg" />
        <p className="w-full pr-4 text-lg font-semibold text-center text-inverted">Connect</p>
      </button>
    );
  } else if (isWrongChain) {
    return (
      <button
        onClick={onSwitchChain}
        title="change network"
        className={`tooltip-change-network min-w-[175px] btn-wallet`}
      >
        <Avatar
          svg={<ExclamationTriangleIcon />}
          className="text-primary avatar !bg-paper"
          fontSize="sm"
          fontWeight="normal"
          gap="3"
          label={walletAddress}
          size="lg"
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
  }

  return (
    <div className={`WalletPopoverV3 popover text-right`}>
      <Popover>
        {({ open, close }) => (
          <>
            <Popover.Button className="btn btn-wallet min-w-[175px]">
              <Avatar
                label={walletAddress}
                src={arbitrumIcon}
                className="!w-[36px] !h-[36px]"
                size="lg"
                fontSize="sm"
                fontWeight="normal"
                gap="3"
              />
            </Popover.Button>
            <Suspense>
              {open && (
                <>
                  <Popover.Overlay className="backdrop" />
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-50 translate-x-20"
                    enterTo="opacity-100 translate-x-0"
                    leave="transition ease-in duration-0"
                    // leaveFrom="opacity-100 translate-x-20"
                    // leaveTo="opacity-100 translate-x-0"
                  >
                    <Popover.Panel className="transform border-l shadow-xl popover-panel">
                      <WalletPopoverV3Body onPopoverClose={close} />
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Suspense>
          </>
        )}
      </Popover>
    </div>
  );
}
