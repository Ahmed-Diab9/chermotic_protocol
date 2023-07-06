import { toast } from 'react-toastify';
import { useAppSelector } from '~/store';
import { Logger, errorLog } from '~/utils/log';
import { isValid } from '~/utils/valid';
import { usePosition } from './usePosition';
import { useSigner } from 'wagmi';
import { useUsumAccount } from './useUsumAccount';
import { useChromaticClient } from './useChromaticClient';
import { useMemo } from 'react';
import { useLiquidityPool } from './useLiquidityPool';
import { bigNumberify, expandDecimals, numberBuffer } from '~/utils/number';
import { TradeInput } from '~/typings/trade';
import { AppError } from '~/typings/error';
import { TradeEvent } from '~/typings/events';

interface Props {
  state?: TradeInput;
}

const logger = Logger('useOpenPosition');
function useOpenPosition(props: Props) {
  const { state } = props;
  const token = useAppSelector((state) => state.token.selectedToken);
  const market = useAppSelector((state) => state.market.selectedMarket);
  const { fetchPositions } = usePosition();
  const { data: signer } = useSigner();
  const { fetchBalances } = useUsumAccount();
  const { client } = useChromaticClient();
  const routerApi = useMemo(() => client?.router(), [client]);
  const {
    liquidity: { longTotalUnusedLiquidity, shortTotalUnusedLiquidity },
  } = useLiquidityPool();

  const onOpenPosition = async function () {
    if (!isValid(state)) {
      toast('Input data needed');
      return;
    }
    if (!isValid(market)) {
      errorLog('no markets selected');
      toast('No markets selected.');
      return;
    }
    if (!isValid(signer)) {
      errorLog('no signers');
      toast('No signers. Create your account.');
      return;
    }
    if (!isValid(routerApi)) {
      errorLog('no routers');
      toast('No routers.');
      return;
    }

    const quantity = bigNumberify(state.quantity * numberBuffer())
      .mul(expandDecimals(4)) // 10000
      .div(numberBuffer());
    const leverage = bigNumberify(state.leverage * numberBuffer())
      .mul(expandDecimals(2)) // 100
      .div(numberBuffer());
    const takerMargin = bigNumberify(Math.floor(state.takerMargin * numberBuffer()))
      .mul(expandDecimals(token?.decimals)) // 10 ** 6
      .div(numberBuffer());
    const makerMargin = bigNumberify(Math.floor(state.makerMargin * numberBuffer()))
      .mul(expandDecimals(token?.decimals)) // 10 ** 6
      .div(numberBuffer());

    if (state.direction === 'long' && longTotalUnusedLiquidity.lte(makerMargin)) {
      errorLog('the long liquidity is too low');
      return AppError.reject('the long liquidity is too low', 'onOpenPosition');
    }
    if (state.direction === 'short' && shortTotalUnusedLiquidity.lte(makerMargin)) {
      logger.error('the short liquidity is too low');
      logger.error(shortTotalUnusedLiquidity);
      return AppError.reject('the short liquidity is too low', 'onOpenPosition');
    }

    // FIXME
    // Trading Fee
    try {
      const maxAllowableTradingFee = makerMargin.add(expandDecimals(token?.decimals));

      await routerApi.openPosition(market.address, {
        quantity: quantity.mul(state.direction === 'long' ? 1 : -1),
        leverage,
        takerMargin,
        makerMargin,
        maxAllowableTradingFee,
      });
      await fetchPositions();
      await fetchBalances();

      window.dispatchEvent(TradeEvent);
      toast('New position is opened.');
    } catch (error) {
      toast((error as any).reason);
    } finally {
      return;
    }
  };

  return {
    onOpenPosition,
  };
}

export { useOpenPosition };
