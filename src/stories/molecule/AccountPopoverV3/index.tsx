import './style.css';

import { Popover } from '@headlessui/react';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { AssetPanel } from '~/stories/molecule/AssetPanel';

import { useAccountPopoverV3 } from './hooks';

export function AccountPopoverV3() {
  const { isConnected, isLoading, isAccountExist, balance, tokenName, tokenImage, onClickConnect } =
    useAccountPopoverV3();

  return (
    <>
      <div className="border-l AccountPopoverV3 border-primary/10 panel panel-transparent">
        <div className="tex8-left pl-7">
          {isAccountExist ? (
            <div className="flex flex-col gap-[2px]">
              <h6 className="text-primary-light">Account balance</h6>
              <h2 className="text-xl">
                <SkeletonElement isLoading={isLoading} width={80}>
                  <Avatar
                    size="xs"
                    fontSize="lg"
                    label={`${balance} ${tokenName}`}
                    gap="1"
                    src={tokenImage}
                  />
                </SkeletonElement>
              </h2>
            </div>
          ) : (
            <Avatar size="sm" fontSize="lg" label="Account balance" gap="2" src={tokenImage} />
          )}
        </div>
        <div className="flex flex-col gap-1 mr-0 text-right">
          {isConnected ? (
            <>
              <Popover.Group className="flex gap-2">
                <AssetPanel type="Deposit" />
                <AssetPanel type="Withdraw" />
              </Popover.Group>
            </>
          ) : (
            <>
              {/* FIXME: separate by states */}
              {/* <Button label="Connect Wallet" css="light" size="sm" onClick={onClickConnect} /> */}
              <Button label="Connect Wallet" css="line" size="sm" onClick={onClickConnect} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
