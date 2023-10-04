import './style.css';

import { Popover } from '@headlessui/react';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { AccountPanelV3 } from '../AccountPanelV3';
// import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { TooltipAlert } from '~/stories/atom/TooltipAlert';
import ArrowTriangleIcon from '~/assets/icons/ArrowTriangleIcon';

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
                      <Popover.Button className="btn btn-unstyled btn-sm">
                        <span className="flex items-center gap-2">
                          {isAccountExist ? (
                            <span className="flex flex-col gap-[2px]">
                              {/* <span className="text-primary-light">Account balance</span> */}
                              <span className="text-xl">
                                <SkeletonElement isLoading={isLoading} width={80}>
                                  <Avatar
                                    // size="xs"
                                    fontSize="xl"
                                    label={`${balance} ${tokenName}`}
                                    gap="1"
                                    src={tokenImage}
                                  />
                                </SkeletonElement>
                              </span>
                            </span>
                          ) : (
                            <>
                              <Avatar
                                size="sm"
                                // label="My Account"
                                fontSize="lg"
                                label="0"
                                gap="2"
                                src={tokenImage}
                                // className="tooltip-account-empty"
                              />
                              {/* <TooltipAlert
                                label="account-empty"
                                tip="To make a deposit, you need to create account first."
                              /> */}
                            </>
                          )}
                          <ArrowTriangleIcon
                            className={`w-4 h-4 ${open ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          />
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
