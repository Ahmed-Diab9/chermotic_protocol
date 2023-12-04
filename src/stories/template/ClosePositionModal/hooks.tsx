import { isNil, isNotNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import { ORACLE_PROVIDER_DECIMALS, PERCENT_DECIMALS, PNL_RATE_DECIMALS } from '~/configs/decimals';
import useFilteredMarkets from '~/hooks/commons/useFilteredMarkets';
import { useClosePosition } from '~/hooks/useClosePosition';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { abs, divPreserved, formatDecimals } from '~/utils/number';
import { ClosePositionModalProps } from '.';

export function useClosePositonModal(props: ClosePositionModalProps) {
  const { isOpen, onClose, position } = props;
  const { tokens } = useSettlementToken();
  const { markets } = useFilteredMarkets();
  const { onClosePosition, isMutating } = useClosePosition({
    positionId: position?.id,
    marketAddress: position?.marketAddress,
  });

  const formattedPosition = useMemo(() => {
    if (isNil(position) || isNil(tokens) || isNil(markets)) {
      return;
    }
    const { tokenAddress, marketAddress, qty, openPrice, collateral, takerMargin, pnl } = position;
    const token = tokens.find((token) => token.address === tokenAddress);
    const market = markets.find((market) => market.address === marketAddress);
    if (isNil(token) || isNil(market)) {
      return;
    }

    const entryPrice = `$ ${formatDecimals(openPrice, ORACLE_PROVIDER_DECIMALS, 2, true)}`;
    const leverage = `${formatDecimals(
      divPreserved(abs(qty), collateral, token.decimals),
      token.decimals,
      2,
      true
    )}x`;
    const pnlPercentage = divPreserved(pnl, takerMargin, PNL_RATE_DECIMALS + PERCENT_DECIMALS);
    const plusSign = pnl > 0n ? '+' : '';
    return {
      qty: `${formatDecimals(abs(qty), token.decimals, 2, true)} ${token.name}`,
      collateral: `${formatDecimals(collateral, token.decimals, 2, true)} ${token.name}`,
      direction: qty > 0n ? 'long' : 'short',
      tokenName: token.name,
      marketDescription: market.description,
      marketImage: market.image,
      entryPrice,
      leverage,
      pnl: `${plusSign}${formatDecimals(pnl, token.decimals, 2, true)} ${token.name}`,
      pnlPercentage: `${plusSign}${formatDecimals(pnlPercentage, PNL_RATE_DECIMALS, 2, true)}%`,
      pnlClass: pnl > 0n ? 'text-price-higher' : 'text-price-lower',
    };
  }, [position, tokens, markets]);

  const onPositionClose = useCallback(async () => {
    await onClosePosition?.();
    onClose?.();
  }, [onClosePosition, onClose]);

  return {
    isOpen: (isOpen && isNotNil(position)) ?? false,
    isMutating,
    position: formattedPosition,
    onClose,
    onPositionClose,
  };
}
