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
} from "~/utils/number";
import { useAppDispatch } from "~/store";
import { poolsAction } from "~/store/reducer/pools";
import { Bin } from "~/typings/pools";
import { Token } from "~/typings/market";
import { isValid } from "~/utils/valid";
import { BIN_VALUE_DECIMAL, FEE_RATE_DECIMAL } from "~/configs/decimals";
import { infoLog } from "~/utils/log";
import { MULTI_ALL, MULTI_REMOVABLE, MULTI_TYPE } from "~/configs/pool";
import { BigNumber } from "ethers";

export interface RemoveMultiLiquidityModalProps {
  selectedBins?: Bin[];
  amount?: number;
  token?: Token;
  type?: MULTI_TYPE;
  balance?: BigNumber;
  binValue?: BigNumber;
  liquidityValue?: BigNumber;
  freeLiquidity?: BigNumber;
  removableRate?: BigNumber;
  onAmountChange?: (type: MULTI_TYPE) => unknown;
  onRemoveLiquidity?: (bins: Bin[], type: MULTI_TYPE) => Promise<unknown>;
}

export const RemoveMultiLiquidityModal = (
  props: RemoveMultiLiquidityModalProps
) => {
  const {
    selectedBins = [],
    type = MULTI_ALL,
    token,
    amount = 0,
    balance = bigNumberify(0),
    binValue = bigNumberify(0),
    liquidityValue = bigNumberify(0),
    freeLiquidity = bigNumberify(0),
    removableRate = bigNumberify(0),
    onAmountChange,
    onRemoveLiquidity,
  } = props;
  const dispatch = useAppDispatch();
  const binDecimals =
    selectedBins.length > 0 ? selectedBins[0].decimals : BIN_VALUE_DECIMAL;

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
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 drop-shadow-xl">
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
                      qty={Number(
                        formatDecimals(bin.balance, bin?.decimals, 2)
                      )}
                      utilizedValue={Number(
                        formatDecimals(utilized, bin?.decimals, 2)
                      )}
                      removableValue={Number(
                        formatDecimals(removable, bin?.decimals, 2)
                      )}
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
                <p className="text-black/30">Total CLB</p>
                <p>{formatDecimals(balance, binDecimals, 2)} CLB</p>
              </div>
              {/**
               * @TODO
               * 총합 유동성 가치
               */}
              <div className="flex justify-between">
                <p className="text-black/30">Total Liquidity Value</p>
                <p>
                  {formatDecimals(liquidityValue, token?.decimals, 2)}{" "}
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
                  {formatDecimals(freeLiquidity, token?.decimals, 2)} CLB
                  <span className="ml-1 text-black/30">
                    {/**
                     * @TODO
                     * 평균 제거 가능한 비율
                     */}
                    ({formatDecimals(removableRate, 2, 2)}%)
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
                    onClick={() => onAmountChange?.(MULTI_ALL)}
                  />
                  <Button
                    className="flex-auto border-gray drop-shadow-md"
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
                    (
                    {amount &&
                      formatDecimals(
                        bigNumberify(amount).mul(binValue),
                        BIN_VALUE_DECIMAL,
                        2
                      )}{" "}
                    {token?.name})
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
                onRemoveLiquidity?.(selectedBins, type);
              }}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
