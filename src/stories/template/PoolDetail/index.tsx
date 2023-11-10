import { AddressWithButton } from '~/stories/atom/AddressWithButton';
import { Outlink } from '~/stories/atom/Outlink';
import { Button } from '~/stories/atom/Button';
import { MetamaskIcon } from '~/assets/icons/SocialIcon';
import { PlusIcon } from '~/assets/icons/Icon';
import { isNil } from 'ramda';
import { useBlockExplorer } from '~/hooks/useBlockExplorer';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { trimAddress } from '~/utils/address';
import { usePoolDetail } from './hooks';

export interface PoolDetailProps {}

export const PoolDetail = (props: PoolDetailProps) => {
  const { lpTitle, lpName, lpTag, lpAddress, onCopyAddress } = usePoolDetail();
  const blockExplorer = useBlockExplorer({
    path: 'address',
    address: lpAddress,
  });

  return (
    <div className="p-5 PoolDetail">
      <div className="flex items-center justify-between w-full gap-3">
        <div className="text-xl text-left">
          <SkeletonElement isLoading={isNil(lpTitle)}>
            <h3>{lpTitle}</h3>
          </SkeletonElement>
          {/* todo: change text-color for each risk - high / mid / low */}
          <div className="flex items-center gap-1 mt-[2px]">
            <h3 className={lpTag}>{lpName}</h3>
            <Button
              iconOnly={<PlusIcon className="w-3 h-3" />}
              css="translucent"
              gap="1"
              size="xs"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <AddressWithButton
            address={lpAddress && trimAddress(lpAddress, 6, 6)}
            // TODO: onclick should be updated to open in a new tab (not copy)
            onClick={onCopyAddress}
            icon="outlink"
            href={blockExplorer}
          />
          {/* <Button
            href={
              clbTokenAddress && blockExplorer
                ? `${blockExplorer}/token/${clbTokenAddress}`
                : undefined
            }
            label="view scanner"
            css="light"
            size="lg"
            iconOnly={<OutlinkIcon />}
          /> */}
        </div>
      </div>
      <div className="pt-3 mt-3 text-left border-t">
        <div className="text-base text-primary-light">
          When providing liquidity to the liquidity pools of the Chromatic protocol, providers
          receive an equivalent amount of CLP tokens.
          <br />
          CLP tokens are independent for each pool, having unique Token IDs and names such as '
          {lpTitle} {lpName} pool'.
          {/* <Outlink outLink="https://chromatic-protocol.gitbook.io/docs/tokens/clb-token-erc-1155" /> */}
        </div>
      </div>
    </div>
  );
};
