import { Button } from '~/stories/atom/Button';
import { Loading } from '~/stories/atom/Loading';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Tag } from '~/stories/atom/Tag';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';

import { Position } from '~/typings/position';

import { usePositionItemV2 } from './hooks';

export interface PositionItemV2Props {
  position: Position;
}

export function PositionItemV2(props: PositionItemV2Props) {
  const {
    tokenName,
    marketDescription,
    qty,
    collateral,
    leverage,
    stopLoss,
    takeProfit,
    profitPriceTo,
    lossPriceTo,
    pnlPercentage,
    lossPrice,
    profitPrice,
    entryPrice,
    entryTime,
    pnlAmount,

    direction,

    onClosePosition,
    onClaimPosition,

    isLoading,

    isOpening,
    isOpened,
    isClosing,
    isClosed,
    tpPriceClass,
    slPriceClass,
    pnlClass,
  } = usePositionItemV2(props);

  return (
    <div className="text-left tr">
      <div className="td td-first">
        <div>
          <div className="text-sm text-primary-light">
            <SkeletonElement isLoading={isLoading} width={40}>
              {entryTime}
            </SkeletonElement>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <SkeletonElement isLoading={isLoading} width={40}>
                <h6>{tokenName}</h6>
              </SkeletonElement>
            </div>
            <div className="flex items-center gap-1 pl-2 border-l">
              <SkeletonElement isLoading={isLoading} width={40}>
                <h6>{marketDescription}</h6>
              </SkeletonElement>
            </div>
            <SkeletonElement isLoading={isLoading} width={40}>
              <Tag label={direction} />
            </SkeletonElement>
          </div>
        </div>
      </div>
      {isOpening && (
        <div className="td">
          <div className="flex items-center text-sm text-primary gap-[6px]">
            <Loading size="sm" />
            <p>Waiting for the next oracle round</p>
            <TooltipGuide iconOnly label="opening-in-progress" />
          </div>
        </div>
      )}
      {isClosing && (
        <div className="td">
          <div className="flex items-center text-sm text-primary gap-[6px]">
            <Loading size="sm" />
            <p>Closing in progress</p>
            <TooltipGuide iconOnly label="closing-in-progress" />
          </div>
        </div>
      )}
      {isOpened && (
        <>
          <div className="td">
            <SkeletonElement isLoading={isLoading} width={40}>
              {entryPrice}
            </SkeletonElement>
          </div>
          <div className="td">
            {/* Contract Qty */}
            <SkeletonElement isLoading={isLoading} width={40}>
              {qty}
            </SkeletonElement>
          </div>
          <div className="td w-[6px] border-r pr-4">
            {/* Leverage */}
            <SkeletonElement isLoading={isLoading} width={40}>
              <Tag label={leverage} className="tag-leverage" />
            </SkeletonElement>
          </div>
          <div className="td w-[6px]">
            {/* TP */}
            <div>
              <SkeletonElement isLoading={isLoading} width={40}>
                {profitPrice}
              </SkeletonElement>
              <div className={`mt-[2px] ${tpPriceClass}`}>
                <SkeletonElement isLoading={isLoading} width={40}>
                  {profitPriceTo}
                </SkeletonElement>
              </div>
            </div>
          </div>
          <div className="td w-[6px]">
            {/* SL */}
            <div>
              <SkeletonElement isLoading={isLoading} width={40}>
                {lossPrice}
              </SkeletonElement>
              <div className={`mt-[2px] ${slPriceClass}`}>
                <SkeletonElement isLoading={isLoading} width={40}>
                  {lossPriceTo}
                </SkeletonElement>
              </div>
            </div>
          </div>
          <div className="td td-pnl">
            {/* PnL */}
            <div>
              <SkeletonElement isLoading={isLoading} width={40}>
                {pnlAmount}
              </SkeletonElement>
              <div className={`mt-[2px] ${pnlClass}`}>
                <SkeletonElement isLoading={isLoading} width={40}>
                  {pnlPercentage}
                </SkeletonElement>
              </div>
            </div>
          </div>
        </>
      )}
      {isClosed && (
        <>
          <div className="pr-4 border-r td">
            <div className="flex text-sm text-primary">
              Your request for closing position has been completed. Please claim the cETH to your
              account.
            </div>
          </div>
          <div className="td td-pnl">
            {/* PnL */}
            <div>
              <SkeletonElement isLoading={isLoading} width={40}>
                {pnlAmount}
              </SkeletonElement>
              <div className={`mt-[2px] ${pnlClass}`}>
                <SkeletonElement isLoading={isLoading} width={40}>
                  {pnlPercentage}
                </SkeletonElement>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="td td-last">
        <div>
          <div>
            {(isOpened || isOpening) && (
              <Button label="Close" css="underlined" size="sm" onClick={onClosePosition} />
            )}
            {isClosed && (
              <Button label="Claim" css="underlined" size="sm" onClick={onClaimPosition} />
            )}
            {isClosing && <Button label="Claim" css="underlined" size="sm" disabled={true} />}
          </div>
        </div>
      </div>
    </div>
  );
}
