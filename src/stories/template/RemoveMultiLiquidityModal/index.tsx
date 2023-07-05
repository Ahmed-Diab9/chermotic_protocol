import { Dialog } from '@headlessui/react';
import { BigNumber, ethers } from 'ethers';
import { CLB_TOKEN_VALUE_DECIMALS, FEE_RATE_DECIMAL } from '~/configs/decimals';
import { MULTI_ALL, MULTI_REMOVABLE, MULTI_TYPE } from '~/configs/pool';
import { useAppDispatch } from '~/store';
import { poolsAction } from '~/store/reducer/pools';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';
import { ScrollAni } from '~/stories/atom/ScrollAni';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { LiquidityItem } from '~/stories/molecule/LiquidityItem';
import { Token } from '~/typings/market';
import { Bin, OwnedBin } from '~/typings/pools';
import {
  bigNumberify,
  expandDecimals,
  formatDecimals,
  numberBuffer,
  percentage,
} from '~/utils/number';
import { Button } from '../../atom/Button';
import '../Modal/style.css';
import { useMemo } from 'react';
import { Logger } from '~/utils/log';

const logger = Logger('RemoveMultiLiquidityModal');
export interface RemoveMultiLiquidityModalProps {
  selectedBins?: OwnedBin[];
  amount?: number;
  token?: Token;
  type?: MULTI_TYPE;
  balance?: BigNumber;
  // liquidityValue?: BigNumber;
  // freeLiquidity?: BigNumber;
  // removableRate?: BigNumber;
  onAmountChange?: (type: MULTI_TYPE) => unknown;
  onRemoveLiquidity?: (bins: OwnedBin[], type: MULTI_TYPE) => Promise<unknown>;
}

export const RemoveMultiLiquidityModal = (props: RemoveMultiLiquidityModalProps) => {
  const {
    selectedBins = [],
    type = MULTI_ALL,
    token,
    amount = 0,
    balance = bigNumberify(0),
    // liquidityValue = bigNumberify(0),
    // freeLiquidity = bigNumberify(0),
    // removableRate = bigNumberify(0),
    onAmountChange,
    onRemoveLiquidity,
  } = props;
  const dispatch = useAppDispatch();
  const convertedAmount = useMemo(() => {
    if (type === MULTI_ALL) {
      return selectedBins.reduce((sum, current) => {
        sum = sum.add(
          current.clbTokenBalance
            .mul(Math.round(current.clbTokenValue * numberBuffer(CLB_TOKEN_VALUE_DECIMALS)))
            .div(numberBuffer(CLB_TOKEN_VALUE_DECIMALS))
        );
        return sum;
      }, BigNumber.from(0));
    } else {
      return selectedBins.reduce((sum, current) => {
        sum = sum.add(
          current.freeLiquidity.gt(current.binValue) ? current.binValue : current.freeLiquidity
        );
        return sum;
      }, BigNumber.from(0));
    }
  }, [type, selectedBins]);

  const calculatedLiquidities = useMemo(() => {
    logger.info('selected bin length', selectedBins.length);

    const totalLiquidityBalance = selectedBins
      .map((bin) => bin.liquidity)
      .reduce((b, curr) => b.add(curr), BigNumber.from(0));
    const totalLiquidityValue = selectedBins.reduce((sum, current) => {
      return sum.add(current.binValue);
    }, BigNumber.from(0));
    const totalRemovableLiquidity = selectedBins
      .map((bin) => {
        return bin.clbTokenBalance
          .mul(Math.round(bin.removableRate * 10 ** 10))
          .div(expandDecimals(10))
          .div(expandDecimals(2));
      })
      .reduce((removableBalance, curr) => removableBalance.add(curr), BigNumber.from(0));
    return {
      totalLiquidity: totalLiquidityBalance,
      totalRemovableLiquidity,
      totalLiquidityValue,
      avgRemovableRate: formatDecimals(
        totalRemovableLiquidity
          .mul(expandDecimals(token?.decimals))
          .mul(expandDecimals(2))
          .div(balance.isZero() ? 1 : balance),
        token?.decimals,
        2
      ),
    };
  }, [type, selectedBins]);

  console.log(amount);

  return (
    <Dialog
      className=""
      open={selectedBins.length > 0}
      onClose={() => {
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
                dispatch(poolsAction.onBinsReset());
              }}
            />
          </Dialog.Title>
          {/* <div className="w-[100px] mx-auto border-b border-2 border-black"></div> */}
          <Dialog.Description className="gap-5 modal-content">
            {/* liquidity items */}
            <article className="relative flex flex-col border border-gray rounded-xl">
              <div className="max-h-[calc(100vh-600px)] overflow-auto">
                {selectedBins.map((bin) => {
                  /**
                   * @TODO
                   * 각 LP 토큰마다 Qty, 이미 사용된 유동성, 제거 가능한 유동성을 계산합니다.
                   */
                  const utilizedRate = 100 - bin.removableRate;
                  const utilized = bin.clbTokenBalance
                    .mul(Math.round(utilizedRate * percentage()))
                    .div(expandDecimals(FEE_RATE_DECIMAL));
                  const removable = bin.clbTokenBalance
                    .mul(Math.round(bin.removableRate * percentage()))
                    .div(expandDecimals(FEE_RATE_DECIMAL));

                  return (
                    <LiquidityItem
                      key={bin.baseFeeRate}
                      token={token?.name}
                      name={bin.clbTokenDescription}
                      qty={Number(formatDecimals(bin.clbTokenBalance, bin?.clbTokenDecimals, 2))}
                      utilizedValue={Number(formatDecimals(utilized, bin?.clbTokenDecimals, 2))}
                      removableValue={Number(formatDecimals(removable, bin?.clbTokenDecimals, 2))}
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
                    label="total-clb"
                    tip="The sum of the quantity of the above liquidity tokens (CLB)."
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
                    label="total-liquidity-value"
                    tip="The total value of the above liquidity tokens, converted into the current value."
                  />
                </p>
                <p>
                  {formatDecimals(calculatedLiquidities.totalLiquidityValue, token?.decimals, 2)}{' '}
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
                    label="removable-liquidity"
                    tip="The amount of liquidity that is currently removable due to not being utilized."
                    outLink="#"
                  />
                </p>
                <p>
                  {formatDecimals(
                    calculatedLiquidities.totalRemovableLiquidity,
                    token?.decimals,
                    2
                  )}{' '}
                  CLB
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
                  <Button
                    className="flex-auto shadow-base border-gray"
                    label="Removable"
                    size="sm"
                    onClick={() => {
                      // FIXME
                      onAmountChange?.(MULTI_REMOVABLE);
                    }}
                  />
                </div>
                <div className="max-w-[220px] relative">
                  <p className="absolute right-0 top-[-28px] text-right text-black/30">
                    {/**
                     * @TODO
                     * 사용자가 입력한 제거 하려는 LP 토큰의 개수에 대해서 USDC 값으로 변환하는 로직입니다.
                     */}
                    {formatDecimals(convertedAmount, token?.decimals, 2)} {token?.name}
                  </p>
                  <p className="text-lg text-black/30">{amount} CLB</p>
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
                utilization status of the liquidity bins in the next oracle round.
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
                onRemoveLiquidity?.(selectedBins, type);
              }}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
