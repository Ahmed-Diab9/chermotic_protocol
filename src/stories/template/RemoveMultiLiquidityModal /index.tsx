import React, { useEffect, useMemo, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../../atom/Button";
import { ModalCloseButton } from "~/stories/atom/ModalCloseButton";
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
import { LPToken } from "~/typings/pools";
import { Token } from "~/typings/market";
import { isValid } from "~/utils/valid";
import { BIN_VALUE_DECIMAL, FEE_RATE_DECIMAL } from "~/configs/decimals";

export interface RemoveMultiLiquidityModalProps {
  selectedLpTokens?: LPToken[];
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
    selectedLpTokens = [],
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
        dispatch(poolsAction.onLpTokensReset());
      }
    };
    document.addEventListener("click", onClickAway);

    return () => {
      document.removeEventListener("click", onClickAway);
    };
  }, [dispatch]);

  /**
   * @TODO
   * 선택한 LP 토큰에 대해 토큰 총합 개수, 총합 유동성, 총합 제거 가능한 유동성을 계산하는 로직입니다.
   */
  const {
    balance: totalBalance,
    liquidity: totalLiquidity,
    removableLiquidity: totalRemovableLiquidity,
  } = useMemo(() => {
    return selectedLpTokens.reduce(
      (record, currentToken) => {
        const { balance, binValue, removableRate } = currentToken;

        /**
         * @TODO
         * 유동성 = LP 토큰 개수 * Bin 값
         */
        const liquidity = balance
          .mul(binValue)
          .div(expandDecimals(BIN_VALUE_DECIMAL));
        /**
         * @TODO
         * 제거 가능한 유동성의 비율 최대치 적용
         */
        const rate = removableRate > 87.5 ? 87.5 : removableRate;
        const removableLiquidity = balance
          .mul(binValue)
          .mul(Math.round(rate * percentage()))
          .div(expandDecimals(FEE_RATE_DECIMAL))
          .div(expandDecimals(BIN_VALUE_DECIMAL));

        return {
          balance: record.balance.add(balance),
          liquidity: record.liquidity.add(liquidity),
          removableLiquidity: record.removableLiquidity.add(removableLiquidity),
        };
      },
      {
        balance: bigNumberify(0),
        liquidity: bigNumberify(0),
        removableLiquidity: bigNumberify(0),
      }
    );
  }, [selectedLpTokens]);

  /**
   * @TODO
   * 여러 LP 토큰에 대해 제거 가능한 비율 평균 계산
   */
  const totalRemovableRate = totalRemovableLiquidity
    .mul(10000)
    .div(totalLiquidity);

  /**
   * @TODO
   * Bin 값 평균 계산
   */
  const totalBinValue = totalLiquidity.div(totalBalance);

  return (
    <Dialog
      className=""
      open={selectedLpTokens.length > 0}
      onClose={() => {
        dispatch(poolsAction.onLpTokensReset());
      }}
    >
      <div className="fixed inset-0 bg-white/80" aria-hidden="true" />
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
        <Dialog.Panel className="modal bg-white w-full max-w-[500px]">
          <Dialog.Title className="modal-title">
            Remove Liquidity
            {/* Bin 개수가 여러개일 때 */}
            <span className="ml-2">({selectedLpTokens.length})</span>
            <ModalCloseButton
              onClick={() => {
                dispatch(poolsAction.onLpTokensReset());
              }}
            />
          </Dialog.Title>
          <div className="w-[100px] mx-auto border-b border-2 border-black"></div>
          <Dialog.Description className="gap-5 modal-content">
            {/* liquidity items */}
            <article className="flex flex-col gap-5 max-h-[calc(100vh-600px)] mx-[-20px] px-[20px] overflow-auto">
              {selectedLpTokens.map((lpToken) => {
                /**
                 * @TODO
                 * 각 LP 토큰마다 Qty, 이미 사용된 유동성, 제거 가능한 유동성을 계산합니다.
                 */
                const utilizedRate = 100 - lpToken.removableRate;
                const removableRate =
                  lpToken.removableRate > 87.5 ? 87.5 : lpToken.removableRate;
                const utilized = lpToken.balance
                  .mul(Math.round(utilizedRate * 10))
                  .div(expandDecimals(3));
                const removable = lpToken.balance
                  .mul(Math.round(removableRate * 10))
                  .div(expandDecimals(3));

                return (
                  <LiquidityItem
                    key={lpToken.feeRate}
                    token={token?.name}
                    name={lpToken.description}
                    qty={Number(
                      formatDecimals(lpToken.balance, token?.decimals, 2)
                    )}
                    utilizedValue={Number(
                      formatDecimals(utilized, token?.decimals, 2)
                    )}
                    removableValue={Number(
                      formatDecimals(removable, token?.decimals, 2)
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
            </article>

            {/* info bottom */}
            <article className="flex flex-col gap-2 pb-5 border-b">
              {/* for single bin */}
              <div className="flex justify-between">
                <p className="text-black/30">My Liquidity Value</p>
                <p>
                  {formatDecimals(totalLiquidity, token?.decimals, 2)}
                  {token?.name}
                </p>
              </div>
            </article>

            {/* input - range */}
            <article>
              <div className="flex justify-between">
                <p className="text-black/30">Removable Liquidity</p>
                <p>
                  {formatDecimals(totalRemovableLiquidity, token?.decimals, 2)}{" "}
                  CLB
                  <span className="ml-1 text-black/30">
                    ({formatDecimals(totalRemovableRate, 2, 2)}%)
                  </span>
                </p>
              </div>

              {/* for multiple bins */}
              {/**
               * @TODO
               * LP 토큰 총합 밸런스
               */}
              <div className="flex justify-between">
                <p className="text-black/30">Total CLB</p>
                <p>{formatDecimals(totalBalance, token?.decimals, 2)} CLB</p>
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
                <div className="max-w-[220px]">
                  <Input
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
                  />
                </div>
              </div>
              <p className="mt-2 text-right text-black/30">
                {/**
                 * @TODO
                 * 사용자가 입력한 제거 하려는 LP 토큰의 개수에 대해서 USDC 값으로 변환하는 로직입니다.
                 */}
                {input &&
                  formatDecimals(
                    bigNumberify(input.amount).mul(totalBinValue),
                    2,
                    2
                  )}{" "}
                {token?.name}
              </p>
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
                if (selectedLpTokens.length > 0 && isValid(input)) {
                  onRemoveLiquidity?.(
                    selectedLpTokens[0].feeRate,
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
