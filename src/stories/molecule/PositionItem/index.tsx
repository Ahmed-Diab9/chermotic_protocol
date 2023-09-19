import CheckIcon from '~/assets/icons/CheckIcon';

import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { Loading } from '~/stories/atom/Loading';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Tag } from '~/stories/atom/Tag';
import { TextRow } from '~/stories/atom/TextRow';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';

import { Position } from '~/typings/position';

import { usePositionItem } from './hooks';

export interface PositionItemProps {
  position: Position;
}

export function PositionItem(props: PositionItemProps) {
  const {
    qty,
    collateral,
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

    tokenName,
    tokenImage,
    marketDescription,
    marketImage,
    tpPriceClass,
    slPriceClass,
    pnlClass,
  } = usePositionItem(props);

  return (
    <div className="mb-3 overflow-hidden border dark:border-transparent bg-paper rounded-xl">
      <div className="flex items-center gap-6 px-5 py-3 border-b bg-paper-light dark:bg-paper">
        <div className={`flex flex-auto items-center gap-6 ${isOpening ? 'opacity-30' : ''}`}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <SkeletonElement isLoading={isLoading} circle width={16} height={16} />
              <SkeletonElement isLoading={isLoading} width={40}>
                <Avatar
                  label={tokenName}
                  src={tokenImage}
                  size="xs"
                  gap="1"
                  fontSize="base"
                  fontWeight="bold"
                />
              </SkeletonElement>
            </div>
            <div className="flex items-center gap-1">
              <SkeletonElement isLoading={isLoading} circle width={16} height={16} />
              <SkeletonElement isLoading={isLoading} width={40}>
                <Avatar
                  label={marketDescription}
                  src={marketImage}
                  size="xs"
                  gap="1"
                  fontSize="base"
                  fontWeight="bold"
                />{' '}
              </SkeletonElement>
            </div>
            <SkeletonElement isLoading={isLoading} width={40}>
              <Tag label={direction} />
            </SkeletonElement>
          </div>
          <div className="flex items-center gap-8 pl-6 border-l">
            <p className="text-primary-light">Entry Price</p>
            <SkeletonElement isLoading={isLoading} width={60}>
              {entryPrice}
            </SkeletonElement>
          </div>
          <div className="flex items-center gap-8 pl-6 border-l">
            <p className="text-primary-light">Entry Time</p>
            <SkeletonElement isLoading={isLoading} width={60}>
              {entryTime}
            </SkeletonElement>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {/* 상태에 따라 내용 변동 */}
          {isOpening && (
            <>
              <Loading size="sm" />
              <div className="flex text-primary">
                {/* Opening in progress */}
                Waiting for the next oracle round
                <TooltipGuide iconOnly label="opening-in-progress" />
              </div>
            </>
          )}
          {isOpened && (
            <>
              <CheckIcon className="w-4" />
              <div className="flex text-primary">
                Opening completed
                <TooltipGuide iconOnly label="opening-completed" />
              </div>
            </>
          )}
          {isClosing && (
            <>
              <Loading size="sm" />
              <div className="flex text-primary">
                Closing in progress
                <TooltipGuide iconOnly label="closing-in-progress" />
              </div>
            </>
          )}
          {isClosed && (
            <>
              <CheckIcon className="w-4" />
              <div className="flex text-primary">
                Closing completed
                <TooltipGuide iconOnly label="closing-completed" />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-stretch justify-between gap-6 px-5 py-4 dark:bg-inverted-lighter">
        <div
          className={`flex flex-auto items-stretch justify-between gap-6 ${
            isOpening ? 'opacity-30' : ''
          }`}
        >
          <div className="grow min-w-[12%] flex flex-col gap-2">
            <TextRow
              label="Contract Qty"
              labelClass="text-primary-light"
              value={qty}
              isLoading={isLoading}
            />
            <TextRow
              label="Collateral"
              labelClass="text-primary-light"
              value={collateral}
              isLoading={isLoading}
            />
          </div>
          <div className="grow min-w-[20%] flex flex-col gap-2 pl-6 border-l">
            <TextRow
              label="Take Profit"
              labelClass="text-primary-light"
              value={takeProfit}
              isLoading={isLoading}
            />
            <TextRow
              label="TP Price"
              labelClass="text-primary-light"
              value={profitPrice}
              subValueLeft={profitPriceTo}
              subValueClass={tpPriceClass}
              isLoading={isLoading}
            />
          </div>
          <div className="grow min-w-[20%] flex flex-col gap-2 pl-6 border-l">
            <TextRow
              label="Stop Loss"
              labelClass="text-primary-light"
              value={stopLoss}
              isLoading={isLoading}
            />
            <TextRow
              label="SL Price"
              labelClass="text-primary-light"
              value={lossPrice}
              subValueLeft={lossPriceTo}
              subValueClass={slPriceClass}
              isLoading={isLoading}
            />
          </div>
          <div className="grow min-w-[8%] flex flex-col gap-2 pl-6 border-l">
            <TextRow
              label="PnL"
              labelClass="text-primary-light"
              value={pnlPercentage}
              valueClass={pnlClass}
              isLoading={isLoading}
            />
            {/* todo: add PnL price (has no label, value only) */}
            <TextRow value={pnlAmount} isLoading={isLoading} />
          </div>
        </div>
        <div className="w-[10%] min-w-[140px] flex flex-col items-center justify-center gap-2 pl-6 border-l">
          {/* 상태에 따라 버튼 css prop, label 다르게 들어감 */}
          {/* Close / Claim USDC */}
          {(isOpened || isOpening) && (
            <Button label="Close" css="light" size="sm" onClick={onClosePosition} />
          )}
          {isClosed && <Button label="Claim" css="active" size="sm" onClick={onClaimPosition} />}
          {isClosing && <Button label="Claim" css="default" size="sm" disabled={true} />}
        </div>
      </div>
    </div>
  );
}
