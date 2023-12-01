import './style.css';

import { Popover } from '@headlessui/react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { ArrowTriangleIcon } from '~/assets/icons/Icon';
import { Avatar } from '~/stories/atom/Avatar';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { AccountPanelV3 } from '../AccountPanelV3';
import { TooltipAlert } from '~/stories/atom/TooltipAlert';
import { ChromaticRowLogo } from '~/assets/icons/Logo';

import { useAccountPopoverV3 } from './hooks';

export function AccountPopoverV3() {
  const { isConnected, isLoading, isAccountExist, balance, tokenImage } = useAccountPopoverV3();

  return (
    <>
      {/* <div className="border-l AccountPopoverV3 border-primary/10 panel panel-transparent"> */}
      <div className="AccountPopoverV3">
        <div className="flex flex-col gap-[6px] text-right">
          {isConnected ? (
            <>
              <Popover.Group className="flex gap-2">
                <Popover>
                  {({ open, close }) => (
                    <>
                      <Popover.Button
                        className={`btn btn-line !h-10 !min-w-[180px] px-3 hover:bg-primary/10 ${
                          open ? 'bg-primary/10' : ''
                        } ${!isAccountExist ? 'tooltip-create-account' : ''}`}
                      >
                        <span className="flex items-center justify-between w-full gap-4">
                          {isAccountExist ? (
                            <>
                              <SkeletonElement isLoading={isLoading} width={80}>
                                <Avatar
                                  size="xs"
                                  fontSize="lg"
                                  // label={`${balance} ${tokenName}`}
                                  label={balance}
                                  gap="1"
                                  src={tokenImage}
                                />
                              </SkeletonElement>
                              <ArrowTriangleIcon
                                className={`w-4 h-4 ${open ? 'rotate-180' : ''}`}
                                aria-hidden="true"
                              />
                            </>
                          ) : (
                            <>
                              <Avatar
                                size="xs"
                                fontSize="lg"
                                label="Create Account"
                                gap="1"
                                src={tokenImage}
                              />
                              <PlusCircleIcon className="w-4 h-4" aria-hidden="true" />
                            </>
                          )}
                        </span>
                      </Popover.Button>
                      <Popover.Panel className="popover-panel w-[600px]">
                        <AccountPanelV3 onPanelClose={close} />
                      </Popover.Panel>
                      <TooltipAlert
                        label="create-account"
                        place="bottom"
                        // isOpen={}
                      >
                        <div className="w-[240px] text-left py-1">
                          <h3 className="text-base">Create Account</h3>
                          <p className="mt-2 text-sm opacity-60">
                            The trading collateral will be paid from the account, not my wallet.
                            Please create an account here before starting trading.
                          </p>
                          {/* <ChromaticRowLogo className="mt-4 opacity-50" /> */}
                        </div>
                      </TooltipAlert>
                    </>
                  )}
                </Popover>
              </Popover.Group>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}
