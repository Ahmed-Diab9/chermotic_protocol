import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../../atom/Button";
import { ModalCloseButton } from "~/stories/atom/ModalCloseButton";
import { Avatar } from "~/stories/atom/Avatar";
import { Progress } from "~/stories/atom/Progress";
import { Input } from "~/stories/atom/Input";
import { Thumbnail } from "~/stories/atom/Thumbnail";
import "../Modal/style.css";
import { LPToken } from "~/typings/pools";
import {
  bigNumberify,
  expandDecimals,
  formatDecimals,
  trimLeftZero,
} from "~/utils/number";
import { useSelectedToken } from "~/hooks/useSettlementToken";
import { useSelectedLiquidityPool } from "~/hooks/useLiquidityPool";
import { SLOT_VALUE_DECIMAL } from "~/configs/pool";
import { isValid } from "~/utils/valid";
import { infoLog } from "~/utils/log";

type PoolRemoveState = {
  removableRate: number;
  tokens: number;
};

type PoolRemoveAction<T extends string = keyof PoolRemoveState> =
  T extends keyof PoolRemoveState
    ? {
        type: T;
        payload: Record<T, PoolRemoveState[T]>;
      }
    : never;

const poolRemoveReducer = (
  state: PoolRemoveState,
  action: PoolRemoveAction
): PoolRemoveState => {
  const { type, payload } = action;
  switch (type) {
    case "removableRate": {
      return {
        ...state,
        removableRate: payload.removableRate,
      };
    }
    case "tokens": {
      return {
        ...state,
        tokens: payload.tokens,
      };
    }
  }
};

interface RemoveLiquidityModalProps {
  lpToken?: LPToken;
  onClose?: () => unknown;
}

export const RemoveLiquidityModal = ({
  lpToken,
  onClose,
}: RemoveLiquidityModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null!);
  const [token] = useSelectedToken();
  const [state, dispatch] = useReducer(poolRemoveReducer, {
    removableRate: 87.5,
    tokens: 0,
  });
  const [_, __, onRemoveLiquidity] = useSelectedLiquidityPool();
  useEffect(() => {
    const onClickAway = (event: MouseEvent) => {
      const clicked = event.target;
      if (!(clicked instanceof Node)) {
        return;
      }
      const isContained = modalRef.current?.contains(clicked);
      if (!isContained) {
        onClose?.();
      }
    };
    document.addEventListener("click", onClickAway);

    return () => {
      document.removeEventListener("click", onClickAway);
    };
  }, [onClose]);

  const maxTokens = useMemo(() => {
    if (!isValid(lpToken)) {
      return;
    }
    const balance = lpToken.balance
      .div(expandDecimals(token?.decimals))
      .toNumber();
    return (balance * state.removableRate) / 100;
  }, [state, lpToken, token]);

  return (
    <Dialog className="" open={!!lpToken} onClose={() => onClose?.()}>
      <div className="fixed inset-0 bg-white/80" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="modal bg-white w-full max-w-[500px]">
          <Dialog.Title className="modal-title">
            Remove Liquidity
            {/* Bin 개수가 여러개일 때 */}
            <span className="ml-2">(2)</span>
            <ModalCloseButton onClick={() => onClose?.()} />
          </Dialog.Title>
          <div className="w-[100px] mx-auto border-b border-2 border-black"></div>
          <Dialog.Description className="gap-5 modal-content">
            {/* liquidity items */}
            <article className="flex flex-col gap-5 max-h-[calc(100vh-600px)] mx-[-20px] px-[20px] overflow-auto">
              <LiquidityItem
                token="USDC"
                name="ETH/USD +0.03%"
                qty={2640.68}
                utilizedValue={820.34}
                removableValue={1820.34}
              />
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
                  {lpToken &&
                    token &&
                    formatDecimals(
                      lpToken.balance.mul(lpToken.slotValue),
                      token.decimals + SLOT_VALUE_DECIMAL,
                      2
                    )}{" "}
                  {token?.name}
                </p>
              </div>
            </article>

            {/* input - range */}
            <article>
              <div className="flex justify-between">
                <p className="text-black/30">Removable Liquidity</p>
                <p>
                  {formatDecimals(
                    lpToken.balance.mul(100 * 87.5).div(100),
                    token?.decimals,
                    2
                  )}{" "}
                  CLB
                  <span className="ml-1 text-black/30">(87.5%)</span>
                </p>
              </div>

              {/* for multiple bins */}
              <div className="flex justify-between">
                <p className="text-black/30">Total CLB</p>
                <p>2,850.24 CLB</p>
              </div>
              <div className="flex justify-between">
                <p className="text-black/30">Total Liquidity Value</p>
                <p>756.36 USDC</p>
              </div>
              <div className="flex justify-between">
                <p className="text-black/30">Removable Liquidity</p>
                <p>
                  756.36 CLB
                  <span className="ml-1 text-black/30">(87.5%)</span>
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
                      const nextTokens = Math.floor((maxTokens * 87.5) / 100);
                      dispatch({
                        type: "tokens",
                        payload: { tokens: nextTokens },
                      });
                    }}
                  />
                </div>
                <div className="max-w-[220px]">
                  <Input
                    unit="CLB"
                    value={state.tokens}
                    onChange={(event) => {
                      const value = trimLeftZero(event.target.value);
                      const parsed = Number(value);
                      if (isNaN(parsed)) {
                        return;
                      }
                      dispatch({ type: "tokens", payload: { tokens: parsed } });
                    }}
                    onClickAway={() => {
                      const nextTokens = Math.floor((maxTokens * 87.5) / 100);
                      dispatch({
                        type: "tokens",
                        payload: { tokens: nextTokens },
                      });
                    }}
                  />
                </div>
              </div>
              <p className="mt-2 text-right text-black/30">0.00 USDC</p>
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
              onClick={() => onRemoveLiquidity?.(lpToken.feeRate, state.tokens)}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

interface LiquidityItemProps {
  token?: string;
  name?: string;
  qty?: number;
  utilizedValue: number;
  removableValue: number;
}

const LiquidityItem = (props: LiquidityItemProps) => {
  const { token = "USDC", name, qty, utilizedValue, removableValue } = props;
  const utilizedPercent = (utilizedValue / (qty ?? 1)) * 100;
  const remoablePercent = (removableValue / (qty ?? 1)) * 100;

  // 숫자에 천단위 쉼표 추가
  // 소수점 2자리 표기

  return (
    <div className="w-full px-4 py-3 border rounded-2xl bg-grayL/20">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b">
        <Thumbnail size="lg" className="rounded" />
        <div>
          <Avatar label={token} size="xs" gap="1" />
          <p className="mt-2 text-black/30">{name}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-black/30">Qty</p>
          <p className="mt-2 text-lg">{qty}</p>
        </div>
      </div>
      <div className="text-sm">
        <div className="flex justify-between mb-2">
          <p className="font-semibold">Utilized</p>
          <p className="font-semibold">Removable</p>
        </div>
        <Progress css="sm" value={utilizedValue} max={qty} />
        <div className="flex justify-between mt-1">
          <p className="">
            {utilizedValue}
            <span className="text-black/30 ml-[2px]">({utilizedPercent}%)</span>
          </p>
          <p className="">
            {removableValue}
            <span className="text-black/30 ml-[2px]">({remoablePercent}%)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
