import { Dialog } from '@headlessui/react';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { MULTI_ALL, MULTI_TYPE } from '~/configs/pool';
import { useRemoveLiquidities } from '~/hooks/useRemoveLiquidities';
import { useAppDispatch } from '~/store';
import { poolsAction } from '~/store/reducer/pools';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';
import { Outlink } from '~/stories/atom/Outlink';
import { ScrollAni } from '~/stories/atom/ScrollAni';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { LiquidityItem } from '~/stories/molecule/LiquidityItem';
import { Token } from '~/typings/market';
import { OwnedBin } from '~/typings/pools';
import { formatDecimals, toBigInt } from '~/utils/number';
import { isValid } from '~/utils/valid';
import { Logger } from '../../../utils/log';
import { Button } from '../../atom/Button';
import '../Modal/style.css';

const logger = Logger('RemoveMultiLiquidityModal');
export interface RemoveMultiLiquidityModalProps {
  selectedBins?: OwnedBin[];
  amount?: number;
  token?: Token;
  type?: MULTI_TYPE;
  balance?: bigint;
  onAmountChange?: (type: MULTI_TYPE) => unknown;
}

export const RemoveMultiLiquidityModal = (props: RemoveMultiLiquidityModalProps) => {
  const {
    selectedBins = [],
    type = MULTI_ALL,
    token,
    amount = 0,
    balance = 0n,
    onAmountChange,
  } = props;
  const dispatch = useAppDispatch();
  const convertedAmount = useMemo(() => {
    if (type === MULTI_ALL) {
      return selectedBins.reduce((sum, current) => {
        sum =
          sum +
          Number(
            formatDecimals(current.binValue, current.clbTokenDecimals, current.clbTokenDecimals)
          );
        return sum;
      }, 0);
    } else {
      return selectedBins.reduce((sum, current) => {
        sum =
          sum +
          Number(
            formatUnits(current.binValue * current.removableRate, current.clbTokenDecimals * 2)
          );
        return sum;
      }, 0);
    }
  }, [type, selectedBins]);

  const calculatedLiquidities = useMemo(() => {
    logger.info('selected bin length', selectedBins.length);

    const totalBalance = selectedBins
      .map((bin) => bin.clbTokenBalance)
      .reduce((b, curr) => b + curr, 0n);
    const totalBinValue = selectedBins.reduce((sum, current) => {
      return (
        sum +
        toBigInt(formatUnits(current.clbTokenBalance * current.clbTokenValue, token?.decimals ?? 0))
      );
    }, 0n);
    const totalLiquidity = selectedBins.reduce((acc, current) => {
      acc += current.liquidity;
      return acc;
    }, 0n);
    const totalFreeLiquidity = selectedBins.reduce((acc, current) => {
      const myLiquidityValue = toBigInt(
        formatUnits(current.clbTokenBalance * current.clbTokenValue, token?.decimals ?? 0)
      );
      if (myLiquidityValue > current.freeLiquidity) {
        acc += current.freeLiquidity;
      } else {
        acc += myLiquidityValue;
      }
      return acc;
    }, 0n);
    return {
      totalBalance,
      totalFreeLiquidity,
      totalBinValue,
      avgRemovableRate: (totalFreeLiquidity * 100n) / (totalLiquidity || 1n),
    };
  }, [type, selectedBins, token]);
  const { onRemoveLiquidities } = useRemoveLiquidities({
    bins: selectedBins,
    type,
  });

  return (
    <Dialog
      className=""
      open={selectedBins.length > 0}
      onClose={() => {
        onAmountChange?.('ALL');
        dispatch(poolsAction.onBinsReset());
      }}
    >
      {/* backdrop */}
      <div className="fixed inset-0 bg-white/80" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 shadow-xl">
        <Dialog.Panel className="modal bg-white w-full max-w-[500px]">
          <Dialog.Title className="modal-title">
            Remove Liquidity
            {/* Bin 개수가 여러개일 때 */}
            <span className="ml-2">({selectedBins.length})</span>
            <ModalCloseButton
              onClick={() => {
                onAmountChange?.('ALL');
                dispatch(poolsAction.onBinsReset());
              }}
            />
          </Dialog.Title>
          {/* <div className="w-[100px] mx-auto border-b border-2 border-black"></div> */}
          <Dialog.Description className="gap-5 modal-content">
            {/* liquidity items */}
            <article className="relative flex flex-col border border-gray rounded-xl">
              <div className="max-h-[calc(100vh-600px)] min-h-[180px] overflow-auto">
                {isValid(token) &&
                  selectedBins.map((bin) => {
                    return (
                      <LiquidityItem
                        key={bin.baseFeeRate}
                        token={token}
                        name={bin.clbTokenDescription}
                        bin={bin}
                      />
                    );
                  })}
              </div>
              <div className="absolute bottom-0 flex justify-center w-full">
                <ScrollAni />
              </div>
            </article>

            {/* info bottom */}
            <article className="flex flex-col gap-2 pb-5 border-b">
              {/**
               * @TODO
               * LP 토큰 총합 밸런스
               */}
              <div className="flex justify-between">
                <p className="flex text-black/30">
                  Total CLB
                  <TooltipGuide
                    label="RemoveMultiLiquidityModal-total-clb"
                    tip="The sum of the quantity of the above liquidity tokens(CLB)."
                  />
                </p>
                <p>{formatDecimals(balance, token?.decimals, 2)} CLB</p>
              </div>
              {/**
               * @TODO
               * 총합 유동성 가치
               */}
              <div className="flex justify-between">
                <p className="flex text-black/30">
                  Total Liquidity Value
                  <TooltipGuide
                    label="RemoveMultiLiquidityModal-total-liquidity-value"
                    tip="The total value of the above liquidity tokens(CLB), converted into the current value."
                  />
                </p>
                <p>
                  {formatDecimals(calculatedLiquidities.totalBinValue, token?.decimals, 2)}{' '}
                  {token?.name}
                </p>
              </div>
              {/**
               * @TODO
               * 총합 제거 가능한 유동성 가치
               */}
              <div className="flex justify-between">
                <p className="flex text-black/30">
                  Removable Liquidity
                  <TooltipGuide
                    label="RemoveMultiLiquidityModal-removable-liquidity"
                    tip="The amount of liquidity that is currently removable due to not being utilized."
                    outLink="https://chromatic-protocol.gitbook.io/docs/liquidity/withdraw-liquidity"
                  />
                </p>
                <p>
                  {formatDecimals(calculatedLiquidities.totalFreeLiquidity, token?.decimals, 2)}{' '}
                  {token?.name}
                  <span className="ml-1 text-black/30">
                    {`${calculatedLiquidities.avgRemovableRate}%`}
                  </span>
                </p>
              </div>
            </article>

            {/* input - number */}
            <article className="">
              <p className="font-semibold">Remove CLB Tokens</p>
              <div className="flex items-center justify-between gap-6 mt-3">
                <div className="flex gap-1">
                  <Button
                    className="flex-auto shadow-base border-gray"
                    label="All"
                    size="sm"
                    onClick={() => onAmountChange?.(MULTI_ALL)}
                  />
                </div>
                <div className="max-w-[220px] relative">
                  <p className="absolute right-0 top-[-28px] text-right text-black/30">
                    {/**
                     * @TODO
                     * 사용자가 입력한 제거 하려는 LP 토큰의 개수에 대해서 USDC 값으로 변환하는 로직입니다.
                     */}
                    {/* {formatDecimals(convertedAmount, token?.decimals, 2)} {token?.name} */}
                    {convertedAmount} {token?.name}
                  </p>
                  <p className="text-lg font-semibold text-black">{amount} CLB</p>
                  {/* <Input
                    unit="CLB"
                    value={input?.amount}
                    onChange={(event) => {
                      const value = trimLeftZero(event.target.value);
                      const parsed = Number(value);
                      if (isNaN(parsed)) {
                        return;
                      }
                      onAmountChange?.(parsed);
                    }}
                    onClickAway={() => {
                      if (!isValid(input) || !isValid(maxAmount)) {
                        return;
                      }
                      if (input.amount > maxAmount) {
                        onMaxChange?.();
                      }
                    }}
                  /> */}
                </div>
              </div>
              <p className="mt-4 text-xs text-black/30">
                Holders can immediately withdraw liquidity by burning the CLB tokens that is not
                collateralized by maker margin. Since the withdrawal takes place in the next oracle
                round, the final amount of removable liquidity is determined based on the
                utilization status of the liquidity bins in the next oracle round.{' '}
                <Outlink outLink="https://chromatic-protocol.gitbook.io/docs/liquidity/withdraw-liquidity" />
              </p>
            </article>
          </Dialog.Description>
          <div className="modal-button">
            <Button
              label="Remove"
              size="xl"
              className="text-lg"
              css="active"
              onClick={() => {
                onRemoveLiquidities();
              }}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
