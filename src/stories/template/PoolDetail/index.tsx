import ArrowTriangleIcon from '~/assets/icons/ArrowTriangleIcon';
import { AddressCopyButton } from '~/stories/atom/AddressCopyButton';
import { Button } from '~/stories/atom/Button';

import { isNil, isNotNil } from 'ramda';
import { useBlockExplorer } from '~/hooks/useBlockExplorer';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { trimAddress } from '~/utils/address';
import { usePoolDetail } from './hooks';

export interface PoolDetailProps {}

export const PoolDetail = (props: PoolDetailProps) => {
  const blockExplorer = useBlockExplorer();
  const { lpTitle, lpName, lpAddress, marketDescription, onCopyAddress } = usePoolDetail();

  return (
    <div className="p-5 PoolDetail">
      <div className="flex items-center justify-between w-full gap-3">
        <div className="text-xl text-left">
          <SkeletonElement isLoading={isNil(lpTitle)}>
            <h3>{lpTitle}</h3>
          </SkeletonElement>
          {/* todo: change text-color for each risk - high / mid / low */}
          <h3 className={`text-risk-high`}>{lpName} Pool</h3>
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
          When providing liquidity to the liquidity bins of the Chromatic protocol, providers are
          rewarded by minting CLB tokens. CLB tokens follow the ERC-1155 standard and have one token
          contract per market, with each bin having its own unique token ID.{' '}
          {/* <Outlink outLink="https://chromatic-protocol.gitbook.io/docs/tokens/clb-token-erc-1155" /> */}
        </div>
        <div className="mt-5">
          <Button
            to="/trade"
            css="underlined"
            label={
              isNotNil(marketDescription) ? `Trade on ${marketDescription} Pool` : 'Market loading'
            }
            iconRight={<ArrowTriangleIcon className="-rotate-90" />}
          />
        </div>
      </div>
    </div>
  );
};
