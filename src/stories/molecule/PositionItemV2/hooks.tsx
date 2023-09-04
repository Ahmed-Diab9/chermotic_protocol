import { isNil } from 'ramda';
import { useMemo } from 'react';
import { parseUnits } from 'viem';

import { useClaimPosition } from '~/hooks/useClaimPosition';
import { useClosePosition } from '~/hooks/useClosePosition';
import { useMarket } from '~/hooks/useMarket';
import { usePositions } from '~/hooks/usePositions';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { POSITION_STATUS, Position } from '~/typings/position';

import { abs, divPreserved, formatDecimals, withComma } from '~/utils/number';

import { ORACLE_PROVIDER_DECIMALS, PERCENT_DECIMALS, PNL_RATE_DECIMALS } from '~/configs/decimals';

import { PositionItemV2Props } from './index';
import { comparePrices } from '~/utils/price';

interface usePositionItemV2 extends PositionItemV2Props {}

export function usePositionItemV2({ position }: usePositionItemV2) {
  const { markets } = useMarket();
  const { currentToken } = useSettlementToken();
  const { isLoading } = usePositions();

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
  const values = useMemo(() => {
    if (isNil(position) || isNil(currentToken)) {
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
      formatDecimals(
        (collateral * 10n ** BigInt(currentToken.decimals)) / qty,
        currentToken.decimals - 2,
        2
      ) + '%';
    const takeProfitRaw =
      abs(qty) === 0n
        ? 0n
        : (makerMargin * parseUnits('1', currentToken.decimals) * 100n * 10000n) /
          parseUnits(String(abs(qty)), currentToken.decimals);
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
        qty: formatDecimals(abs(qty), currentToken.decimals, 2, true),
        collateral: formatDecimals(collateral, currentToken.decimals, 2, true),
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
      qty: formatDecimals(abs(qty), currentToken.decimals, 2, true),
      collateral: formatDecimals(collateral, currentToken.decimals, 2, true),
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
      pnlAmount:
        formatDecimals(position.pnl, currentToken.decimals, 2, true) + ' ' + currentToken.name,
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
  }, [position, currentToken, markets]);

  const key = position.id.toString();

  const direction = position.qty > 0n ? 'Long' : 'Short';

  const { onClosePosition } = useClosePosition({
    positionId: position.id,
    marketAddress: position.marketAddress,
  });
  const { onClaimPosition } = useClaimPosition({
    positionId: position.id,
    market: markets?.find((market) => market.address === position.marketAddress),
  });

  const isOpening = position.status === POSITION_STATUS.OPENING;
  const isOpened = position.status === POSITION_STATUS.OPENED;
  const isClosing = position.status === POSITION_STATUS.CLOSING;
  const isClosed = position.status === POSITION_STATUS.CLOSED;

  const tokenName = currentToken?.name;
  const marketDescription = markets?.find(
    (market) => market.address === position.marketAddress
  )?.description;

  const tpPriceClass = comparePrices(position, 'toProfit');
  const slPriceClass = comparePrices(position, 'toLoss');
  const pnlClass =
    position.pnl > 0n ? 'text-price-higher' : position.pnl < 0n ? 'text-price-lower' : '';

  return {
    ...values,

    key,

    direction,

    onClosePosition,
    onClaimPosition,

    isLoading,

    isOpening,
    isOpened,
    isClosing,
    isClosed,

    tokenName,
    marketDescription,

    tpPriceClass,
    slPriceClass,
    pnlClass,
  };
}
