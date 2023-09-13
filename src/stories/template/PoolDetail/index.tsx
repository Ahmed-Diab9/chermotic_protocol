import { AddressCopyButton } from '~/stories/atom/AddressCopyButton';
import { Button } from '~/stories/atom/Button';
import { Outlink } from '~/stories/atom/Outlink';
import OutlinkIcon from '~/assets/icons/OutlinkIcon';
import ArrowTriangleIcon from '~/assets/icons/ArrowTriangleIcon';

import { useBlockExplorer } from '~/hooks/useBlockExplorer';
import { copyText } from '~/utils/clipboard';
import { useMarket } from '~/hooks/useMarket';
import { trimAddress } from '~/utils/address';
import { isNotNil } from 'ramda';

export interface PoolDetailProps {}

export const PoolDetail = (props: PoolDetailProps) => {
  const { currentMarket: selectedMarket, clbTokenAddress } = useMarket();
  const blockExplorer = useBlockExplorer();

  return (
    <div className="p-5 PoolDetail panel">
      <div className="flex items-center justify-between w-full gap-3">
        <div className="text-xl text-left">
          <h3>CLP-ETH-BTC/USD</h3>
          {/* todo: change text-color for each risk - high / mid / low */}
          <h3 className={`text-risk-high`}>Junior Pool</h3>
        </div>
        <div className="flex gap-2">
          <AddressCopyButton
            address={clbTokenAddress && trimAddress(clbTokenAddress, 6, 6)}
            onClick={() => {
              if (clbTokenAddress) {
                copyText(clbTokenAddress);
              }
            }}
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
              isNotNil(selectedMarket)
                ? `Trade on ${selectedMarket.description} Pool`
                : 'Market loading'
            }
            iconRight={<ArrowTriangleIcon className="-rotate-90" />}
          />
        </div>
      </div>
    </div>
  );
};
