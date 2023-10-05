import './style.css';

import { Popover } from '@headlessui/react';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { AccountPanelV3 } from '../AccountPanelV3';
// import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { TooltipAlert } from '~/stories/atom/TooltipAlert';
import ArrowTriangleIcon from '~/assets/icons/ArrowTriangleIcon';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

import { useAccountPopoverV3 } from './hooks';

export function AccountPopoverV3() {
  const { isConnected, isLoading, isAccountExist, balance, tokenName, tokenImage, onClickConnect } =
    useAccountPopoverV3();

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
                      <Popover.Button className="btn btn-line !h-10 !min-w-[180px] px-3 hover:bg-primary/10">
                        <span className="flex items-center justify-between w-full gap-4">
                          {isAccountExist ? (
                            <>
                              <SkeletonElement isLoading={isLoading} width={80}>
                                <Avatar
                                  size="xs"
                                  fontSize="lg"
                                  // label={`${balance} ${tokenName}`}
                                  label={`${balance}`}
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
                        <AccountPanelV3 />
                      </Popover.Panel>
                    </>
                  )}
                </Popover>
              </Popover.Group>
            </>
          ) : (
            <>
              {/* FIXME: separate by states */}
              {/* <Button label="Connect Wallet" css="light" size="sm" onClick={onClickConnect} /> */}
              {/* <Button label="Connect Wallet" css="line" size="sm" onClick={onClickConnect} /> */}
            </>
          )}
        </div>
      </div>
    </>
  );
}
