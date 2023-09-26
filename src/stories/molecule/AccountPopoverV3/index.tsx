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
      <div className="AccountPopoverV3 panel">
        <div className="ml-5">
          <Avatar size="base" fontSize="lg" label="Account balance" gap="2" src={tokenImage} />
        </div>
        <div className="flex flex-col gap-1 mr-5 text-right">
          {isConnected ? (
            <>
              {isAccountExist && (
                <h2 className="text-xl">
                  <SkeletonElement isLoading={isLoading} width={120}>
                    {balance} {tokenName}
                  </SkeletonElement>
                </h2>
              )}
              <Popover.Group className="flex gap-2">
                <AssetPanel type="Deposit" />
                <AssetPanel type="Withdraw" />
              </Popover.Group>
            </>
          ) : (
            <>
              {/* FIXME: separate by states */}
              <Button label="Connect Wallet" css="light" size="sm" onClick={onClickConnect} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
