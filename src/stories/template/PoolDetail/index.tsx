import { AddressCopyButton } from '~/stories/atom/AddressCopyButton';
import { Outlink } from '~/stories/atom/Outlink';

import { isNil } from 'ramda';
import { useBlockExplorer } from '~/hooks/useBlockExplorer';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { trimAddress } from '~/utils/address';
import { usePoolDetail } from './hooks';

export interface PoolDetailProps {}

export const PoolDetail = (props: PoolDetailProps) => {
  const blockExplorer = useBlockExplorer();
  const { lpTitle, lpName, lpTag, lpAddress, onCopyAddress } = usePoolDetail();

  return (
    <div className="p-5 PoolDetail">
      <div className="flex items-center justify-between w-full gap-3">
        <div className="text-xl text-left">
          <SkeletonElement isLoading={isNil(lpTitle)}>
            <h3>{lpTitle}</h3>
          </SkeletonElement>
          {/* todo: change text-color for each risk - high / mid / low */}
          <h3 className={lpTag}>{lpName}</h3>
        </div>
        <div className="flex gap-2">
          <AddressCopyButton
            address={lpAddress && trimAddress(lpAddress, 6, 6)}
            onClick={onCopyAddress}
            className="min-w-[200px]"
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
          receive an equivalent amount of CLP tokens. <br />
          CLP tokens are independent for each pool, having unique Token IDs and names such as
          'USDT-ETH/USD:Junior pool'.
          <Outlink outLink="https://chromatic-protocol.gitbook.io/docs/tokens/clb-token-erc-1155" />
        </div>
      </div>
    </div>
  );
};
