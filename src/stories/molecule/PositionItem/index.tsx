import { isNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import { Token, Market } from '~/typings/market';
import { POSITION_STATUS, Position } from '~/typings/position';
import { abs, divPreserved, formatDecimals, withComma } from '~/utils/number';
import { parseUnits } from 'viem';
import { ORACLE_PROVIDER_DECIMALS, PERCENT_DECIMALS, PNL_RATE_DECIMALS } from '~/configs/decimals';
import { useClosePosition } from '~/hooks/useClosePosition';
import { useClaimPosition } from '~/hooks/useClaimPosition';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Avatar } from '~/stories/atom/Avatar';
import { Loading } from '~/stories/atom/Loading';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import CheckIcon from '~/assets/icons/CheckIcon';
import { TextRow } from '~/stories/atom/TextRow';
import { Button } from '~/stories/atom/Button';
import { Tag } from '~/stories/atom/Tag';
import { comparePrices } from '~/utils/price';

interface Props {
  position: Position;
  isLoading?: boolean;
  token?: Token;
  markets?: Market[];
}

export const PositionItem = function (props: Props) {
  const { position, isLoading, token, markets } = props;

  function priceTo(position: Position, type: 'toProfit' | 'toLoss') {
    const value = formatDecimals(position[type], ORACLE_PROVIDER_DECIMALS - 2, 2);
    const hasProfit = type === 'toProfit' ? position.qty > 0n : position.qty <= 0n;
    if (hasProfit) {
      return `(+${withComma(value)}%)`;
    } else {
      return `(${withComma(value)}%)`;
    }
  }

  /**
   * FIXME
   * Oracle Decimals을 확인해야 함
   */
  const calculated = useMemo(() => {
    if (isNil(position) || isNil(token)) {
      return {
        qty: '-',
        collateral: '-',
        stopLoss: '-',
        takeProfit: '-',
        profitPriceTo: '-',
        lossPriceTo: '-',
        pnl: '-',
        lossPrice: '-',
        profitPrice: '-',
        entryPrice: '-',
        entryTime: '-',
        pnlAmount: '-',
      };
    }
    const { collateral, qty, makerMargin, takerMargin } = position;
    const stopLoss =
      formatDecimals((collateral * 10n ** BigInt(token.decimals)) / qty, token.decimals - 2, 2) +
      '%';
    const takeProfitRaw =
      abs(qty) === 0n
        ? 0n
        : (makerMargin * parseUnits('1', token.decimals) * 100n * 10000n) /
          parseUnits(String(abs(qty)), token.decimals);
    const takeProfit = formatDecimals(takeProfitRaw, 4, 2) + '%';
    const currentOracleVersion = markets?.find(
      (market) => market.address === position.marketAddress
    )?.oracleValue;
    if (
      isNil(currentOracleVersion) ||
      isNil(currentOracleVersion.version) ||
      currentOracleVersion.version <= position.openVersion
    ) {
      return {
        qty: formatDecimals(abs(qty), token.decimals, 2, true),
        collateral: formatDecimals(collateral, token.decimals, 2, true),
        stopLoss,
        takeProfit,
        profitPriceTo: '-',
        lossPriceTo: '-',
        pnl: '-',
        lossPrice: '-',
        profitPrice: '-',
        entryPrice: '-',
        entryTime: '-',
        pnlAmount: '-',
      };
    }
    const pnlPercentage = divPreserved(
      position.pnl,
      takerMargin,
      PNL_RATE_DECIMALS + PERCENT_DECIMALS
    );
    return {
      qty: formatDecimals(abs(qty), token.decimals, 2, true),
      collateral: formatDecimals(collateral, token.decimals, 2, true),
      takeProfit: withComma(takeProfit),
      stopLoss: withComma(stopLoss),
      profitPriceTo: priceTo(position, 'toProfit'),
      lossPriceTo: priceTo(position, 'toLoss'),
      pnlPercentage: `${pnlPercentage > 0n ? '+' : ''}${formatDecimals(
        pnlPercentage,
        PNL_RATE_DECIMALS,
        2,
        true
      )}%`,
      pnlAmount: formatDecimals(position.pnl, token.decimals, 2, true) + ' ' + token.name,
      profitPrice: formatDecimals(abs(position.profitPrice), ORACLE_PROVIDER_DECIMALS, 2, true),
      lossPrice: formatDecimals(abs(position.lossPrice), ORACLE_PROVIDER_DECIMALS, 2, true),
      entryPrice: '$ ' + formatDecimals(position.openPrice, ORACLE_PROVIDER_DECIMALS, 2, true),
      entryTime: new Intl.DateTimeFormat('en-US', {
        second: '2-digit',
        minute: '2-digit',
        hour: '2-digit',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour12: false,
      }).format(new Date(Number(position.openTimestamp) * 1000)),
    };
  }, [position, token, markets]);

  const direction = useCallback((position: Position) => {
    return position.qty > 0n ? 'Long' : 'Short';
  }, []);

  const { onClosePosition } = useClosePosition({
    positionId: position.id,
    marketAddress: position.marketAddress,
  });
  const { onClaimPosition } = useClaimPosition({
    positionId: position.id,
    market: markets?.find((market) => market.address === position.marketAddress),
  });

  return (
    <div
      key={position.id.toString()}
      className="mb-3 overflow-hidden border dark:border-transparent bg-paper rounded-xl"
    >
      <div className="flex items-center gap-6 px-5 py-3 border-b bg-paper-lighter dark:bg-paper">
        <div
          className={`flex flex-auto items-center gap-6 ${
            position.status === POSITION_STATUS.OPENING ? 'opacity-30' : ''
          }`}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <SkeletonElement isLoading={isLoading} circle width={16} height={16} />
              <SkeletonElement isLoading={isLoading} width={40}>
                <Avatar label={token?.name} size="xs" gap="1" fontSize="base" fontWeight="bold" />
              </SkeletonElement>
            </div>
            <div className="flex items-center gap-1">
              <SkeletonElement isLoading={isLoading} circle width={16} height={16} />
              <SkeletonElement isLoading={isLoading} width={40}>
                <Avatar
                  label={
                    markets?.find((market) => market.address === position.marketAddress)
                      ?.description
                  }
                  size="xs"
                  gap="1"
                  fontSize="base"
                  fontWeight="bold"
                />{' '}
              </SkeletonElement>
            </div>
            <SkeletonElement isLoading={isLoading} width={40}>
              <Tag label={direction(position)} />
            </SkeletonElement>
          </div>
          <div className="flex items-center gap-8 pl-6 border-l">
            <p className="text-primary-light">Entry Price</p>
            <SkeletonElement isLoading={isLoading} width={60}>
              {calculated.entryPrice}
            </SkeletonElement>
          </div>
          <div className="flex items-center gap-8 pl-6 border-l">
            <p className="text-primary-light">Entry Time</p>
            <SkeletonElement isLoading={isLoading} width={60}>
              {calculated.entryTime}
            </SkeletonElement>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {/* 상태에 따라 내용 변동 */}
          {position.status === POSITION_STATUS.OPENING && (
            <>
              <Loading size="sm" />
              <div className="flex text-primary">
                {/* Opening in progress */}
                Waiting for the next oracle round
                <TooltipGuide iconOnly label="opening-in-progress" />
              </div>
            </>
          )}
          {position.status === POSITION_STATUS.OPENED && (
            <>
              <CheckIcon className="w-4" />
              <div className="flex text-primary">
                Opening completed
                <TooltipGuide iconOnly label="opening-completed" />
              </div>
            </>
          )}
          {position.status === POSITION_STATUS.CLOSING && (
            <>
              <Loading size="sm" />
              <div className="flex text-primary">
                Closing in progress
                <TooltipGuide iconOnly label="closing-in-progress" />
              </div>
            </>
          )}
          {position.status === POSITION_STATUS.CLOSED && (
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
      <div className="flex items-stretch justify-between gap-6 px-5 py-4 dark:bg-[#29292D]">
        <div
          className={`flex flex-auto items-stretch justify-between gap-6 ${
            position.status === POSITION_STATUS.OPENING ? 'opacity-30' : ''
          }`}
        >
          <div className="grow min-w-[12%] flex flex-col gap-2">
            <TextRow
              label="Contract Qty"
              labelClass="text-primary-light"
              value={calculated.qty}
              isLoading={isLoading}
            />
            <TextRow
              label="Collateral"
              labelClass="text-primary-light"
              value={calculated.collateral}
              isLoading={isLoading}
            />
          </div>
          <div className="grow min-w-[20%] flex flex-col gap-2 pl-6 border-l">
            <TextRow
              label="Take Profit"
              labelClass="text-primary-light"
              value={calculated.takeProfit}
              isLoading={isLoading}
            />
            <TextRow
              label="TP Price"
              labelClass="text-primary-light"
              value={calculated.profitPrice}
              subValueLeft={calculated.profitPriceTo}
              subValueClass={comparePrices(position, 'toProfit')}
              isLoading={isLoading}
            />
          </div>
          <div className="grow min-w-[20%] flex flex-col gap-2 pl-6 border-l">
            <TextRow
              label="Stop Loss"
              labelClass="text-primary-light"
              value={calculated.stopLoss}
              isLoading={isLoading}
            />
            <TextRow
              label="SL Price"
              labelClass="text-primary-light"
              value={calculated.lossPrice}
              subValueLeft={calculated.lossPriceTo}
              subValueClass={comparePrices(position, 'toLoss')}
              isLoading={isLoading}
            />
          </div>
          <div className="grow min-w-[8%] flex flex-col gap-2 pl-6 border-l">
            <TextRow
              label="PnL"
              labelClass="text-primary-light"
              value={calculated.pnlPercentage}
              valueClass={
                position.pnl > 0n
                  ? 'text-price-higher'
                  : position.pnl < 0n
                  ? 'text-price-lower'
                  : ''
              }
              isLoading={isLoading}
            />
            {/* todo: add PnL price (has no label, value only) */}
            <TextRow value={calculated.pnlAmount} isLoading={isLoading} />
          </div>
        </div>
        <div className="w-[10%] min-w-[140px] flex flex-col items-center justify-center gap-2 pl-6 border-l">
          {/* 상태에 따라 버튼 css prop, label 다르게 들어감 */}
          {/* Close / Claim USDC */}
          {(position.status === POSITION_STATUS.OPENED ||
            position.status === POSITION_STATUS.OPENING) && (
            <Button
              label="Close"
              css="light"
              size="sm"
              onClick={() => {
                onClosePosition();
              }}
            />
          )}
          {position.status === POSITION_STATUS.CLOSED && (
            <Button
              label="Claim"
              css="active"
              size="sm"
              onClick={() => {
                onClaimPosition();
              }}
            />
          )}
          {position.status === POSITION_STATUS.CLOSING && (
            <Button label="Claim" size="sm" disabled={true} css="default" />
          )}
        </div>
      </div>
    </div>
  );
};
