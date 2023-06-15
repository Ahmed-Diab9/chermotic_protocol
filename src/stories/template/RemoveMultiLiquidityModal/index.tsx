import React, { useEffect, useMemo, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../../atom/Button";
import { ModalCloseButton } from "~/stories/atom/ModalCloseButton";
import { ScrollAni } from "~/stories/atom/ScrollAni";
import { Input } from "~/stories/atom/Input";
import { LiquidityItem } from "~/stories/molecule/LiquidityItem";
import "../Modal/style.css";
import {
  bigNumberify,
  expandDecimals,
  formatDecimals,
  percentage,
  trimLeftZero,
} from "~/utils/number";
import { useAppDispatch } from "~/store";
import { poolsAction } from "~/store/reducer/pools";
import { Bin } from "~/typings/pools";
import { Token } from "~/typings/market";
import { isValid } from "~/utils/valid";
import { BIN_VALUE_DECIMAL, FEE_RATE_DECIMAL } from "~/configs/decimals";

export interface RemoveMultiLiquidityModalProps {
  selectedBins?: Bin[];
  token?: Token;
  input?: {
    amount: number;
    removableRate: number;
  };
  maxAmount?: number;
  onAmountChange?: (nextAmount: number) => unknown;
  onMaxChange?: () => unknown;
  onRemoveLiquidity?: (feeRate: number, amount: number) => Promise<unknown>;
}

export const RemoveMultiLiquidityModal = (
  props: RemoveMultiLiquidityModalProps
) => {
  const {
    selectedBins = [],
    token,
    input,
    maxAmount,
    onAmountChange,
    onMaxChange,
    onRemoveLiquidity,
  } = props;
  const dispatch = useAppDispatch();
  const modalRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const onClickAway = (event: MouseEvent) => {
      const clicked = event.target;
      if (!(clicked instanceof Node)) {
        return;
      }
      const isContained = modalRef.current?.contains(clicked);
      if (!isContained) {
        dispatch(poolsAction.onBinsReset());
      }
    };
    document.addEventListener("click", onClickAway);

    return () => {
      document.removeEventListener("click", onClickAway);
    };
  }, [dispatch]);

  const binDecimals =
    selectedBins.length > 0 ? selectedBins[0].decimals : BIN_VALUE_DECIMAL;

  /**
   * @TODO
   * 선택한 CLB 토큰에 대해 토큰 총합 개수, 유동성 가치, 총합 유동성, 총합 제거 가능한 유동성을 계산하는 로직입니다.
   */
  const {
    balance: totalBalance,
    liquidityValue: totalLiquidityValue,
    liquidity: totalLiquidity,
    removableLiquidity: totalFreeLiquidity,
  } = useMemo(() => {
    return selectedBins.reduce(
      (record, bin) => {
        const { balance, binValue, liquidity, freeLiquidity } = bin;
        const liquidityValue = balance
          .mul(binValue)
          .div(expandDecimals(BIN_VALUE_DECIMAL));

        return {
          balance: record.balance.add(balance),
          liquidityValue: record.liquidityValue.add(liquidityValue),
          liquidity: record.liquidity.add(liquidity),
          removableLiquidity: record.removableLiquidity.add(freeLiquidity),
        };
      },
      {
        balance: bigNumberify(0),
        liquidityValue: bigNumberify(0),
        liquidity: bigNumberify(0),
        removableLiquidity: bigNumberify(0),
      }
    );
  }, [selectedBins]);

  /**
   * @TODO
   * 여러 LP 토큰에 대해 제거 가능한 비율 평균 계산
   */
  const totalRemovableRate = totalFreeLiquidity
    .mul(expandDecimals(FEE_RATE_DECIMAL))
    .div(totalLiquidityValue);

  /**
   * @TODO
   * Bin 값 평균 계산
   */
  const totalBinValue = totalLiquidityValue.div(totalBalance);

  return (
    <Dialog
      className=""
      open={selectedBins.length > 0}
      onClose={() => {
        dispatch(poolsAction.onBinsReset());
      }}
    >
      <div className="fixed inset-0 bg-white/80" aria-hidden="true" />
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
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
                const utilized = bin.balance
                  .mul(Math.round(utilizedRate * percentage()))
                  .div(expandDecimals(FEE_RATE_DECIMAL));
                const removable = bin.balance
                  .mul(Math.round(bin.removableRate * percentage()))
                  .div(expandDecimals(FEE_RATE_DECIMAL));

                return (
                  <LiquidityItem
                    key={bin.baseFeeRate}
                    token={token?.name}
                    name={bin.description}
                    qty={Number(formatDecimals(bin.balance, bin?.decimals, 2))}
                    utilizedValue={Number(
                      formatDecimals(utilized, bin?.decimals, 2)
                    )}
                    removableValue={Number(
                      formatDecimals(removable, bin?.decimals, 2)
                    )}
                  />
                );
              })}
                {/**
                 * LiquidityItem 컴포넌트 예시
                 */}
                <LiquidityItem
                  token="USDC"
                  name="ETH/USD +0.03%"
                  qty={2500.03}
                  utilizedValue={135.12}
                  removableValue={2364.91}
                />
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
                <p className="text-black/30">Total CLB</p>
                <p>{formatDecimals(totalBalance, binDecimals, 2)} CLB</p>
              </div>
              {/**
               * @TODO
               * 총합 유동성 가치
               */}
              <div className="flex justify-between">
                <p className="text-black/30">Total Liquidity Value</p>
                <p>
                  {formatDecimals(totalLiquidity, token?.decimals, 2)}{" "}
                  {token?.name}
                </p>
              </div>
              {/**
               * @TODO
               * 총합 제거 가능한 유동성 가치
               */}
              <div className="flex justify-between">
                <p className="text-black/30">Removable Liquidity</p>
                <p>
                  {formatDecimals(totalRemovableLiquidity, token?.decimals, 2)}{" "}
                  CLB
                  <span className="ml-1 text-black/30">
                    {/**
                     * @TODO
                     * 평균 제거 가능한 비율
                     */}
                    ({formatDecimals(totalRemovableRate, 2, 2)}%)
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
                    className="flex-auto border-gray drop-shadow-md"
                    label="All"
                    size="sm"
                  />
                  <Button
                    className="flex-auto border-gray drop-shadow-md"
                    label="Removable"
                    size="sm"
                    onClick={() => {
                      onMaxChange?.();
                    }}
                  />
                </div>
                <div className="max-w-[220px] relative">
                  <p className="absolute right-0 top-[-28px] text-right text-black/30">
                    {/**
                     * @TODO
                     * 사용자가 입력한 제거 하려는 LP 토큰의 개수에 대해서 USDC 값으로 변환하는 로직입니다.
                     */}
                    (
                    {input &&
                      formatDecimals(
                        bigNumberify(input.amount).mul(totalBinValue),
                        2,
                        2
                      )}{" "}
                    {token?.name})
                  </p>
                  <p className="text-lg text-black/30">0.00 CLB</p>
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
                Please set additional values to apply to the basic formula in
                Borrow Fee. Calculated based on open Interest and stop
                profit/Loss rate.
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
                if (selectedBins.length > 0 && isValid(input)) {
                  onRemoveLiquidity?.(
                    selectedBins[0].baseFeeRate,
                    input.amount
                  );
                }
              }}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
