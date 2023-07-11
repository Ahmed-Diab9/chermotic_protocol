import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { useAppSelector } from '~/store';
import { AppError } from '~/typings/error';
import { TradeEvent } from '~/typings/events';
import { TradeInput } from '~/typings/trade';
import { Logger, errorLog } from '~/utils/log';
import { expandDecimals, numberBuffer } from '~/utils/number';
import { isValid } from '~/utils/valid';
import { useChromaticClient } from './useChromaticClient';
import { useLiquidityPool } from './useLiquidityPool';
import { usePosition } from './usePosition';
import { useUsumAccount } from './useUsumAccount';
import { useWalletClient } from 'wagmi';

interface Props {
  state?: TradeInput;
}

const logger = Logger('useOpenPosition');
function useOpenPosition(props: Props) {
  const { state } = props;
  const token = useAppSelector((state) => state.token.selectedToken);
  const market = useAppSelector((state) => state.market.selectedMarket);
  const { fetchPositions } = usePosition();
  const { data: walletClient } = useWalletClient();
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
    if (!isValid(walletClient)) {
      errorLog('no signers');
      toast('No signers. Create your account.');
      return;
    }
    if (!isValid(routerApi)) {
      errorLog('no routers');
      toast('No routers.');
      return;
    }

    const quantity =
      (BigInt(Math.floor(Number(state.quantity) * numberBuffer())) * expandDecimals(4)) / // 10000
      BigInt(numberBuffer());
    const leverage = Math.floor(Number(state.leverage)) * 100; // 100
    const takerMargin =
      (BigInt(Math.floor(state.takerMargin * numberBuffer())) * expandDecimals(token?.decimals)) / // 10 ** 6
      BigInt(numberBuffer());
    const makerMargin =
      (BigInt(Math.floor(state.makerMargin * numberBuffer())) * expandDecimals(token?.decimals)) / // 10 ** 6
      BigInt(numberBuffer());

    if (state.direction === 'long' && longTotalUnusedLiquidity <= makerMargin) {
      errorLog('the long liquidity is too low');
      return AppError.reject('the long liquidity is too low', 'onOpenPosition');
    }
    if (state.direction === 'short' && shortTotalUnusedLiquidity <= makerMargin) {
      logger.error('the short liquidity is too low');
      logger.error(shortTotalUnusedLiquidity);
      return AppError.reject('the short liquidity is too low', 'onOpenPosition');
    }

    // FIXME
    // Trading Fee
    try {
      const maxAllowableTradingFee = makerMargin + expandDecimals(token?.decimals);

      await routerApi.openPosition(market.address, {
        quantity: quantity * (state.direction === 'long' ? 1n : -1n),
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
