import React from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '../../atom/Button';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';
import { Input } from '~/stories/atom/Input';
import { LiquidityItem } from '~/stories/molecule/LiquidityItem';
import '../Modal/style.css';
import {
  bigNumberify,
  expandDecimals,
  formatDecimals,
  percentage,
  trimLeftZero,
} from '~/utils/number';
import { useAppDispatch } from '~/store';
import { poolsAction } from '~/store/reducer/pools';
import { Bin, OwnedBin } from '~/typings/pools';
import { Token } from '~/typings/market';
import { isValid } from '~/utils/valid';
import { CLB_TOKEN_VALUE_DECIMALS, FEE_RATE_DECIMAL } from '~/configs/decimals';
import { useRemoveLiquidity } from '~/hooks/useRemoveLiquidity';

export interface RemoveLiquidityModalProps {
  selectedBin?: OwnedBin;
  token?: Token;
  amount?: number;
  maxAmount?: number;
  onAmountChange?: (nextAmount: number) => unknown;
  onMaxChange?: () => unknown;
}

export const RemoveLiquidityModal = (props: RemoveLiquidityModalProps) => {
  const { selectedBin, token, amount, maxAmount, onAmountChange, onMaxChange } = props;
  const dispatch = useAppDispatch();
  const balance = isValid(selectedBin) ? selectedBin.clbTokenBalance : bigNumberify(0);
  const utilizedRate = isValid(selectedBin) ? 100 - selectedBin.removableRate : 0;
  const utilized = isValid(selectedBin)
    ? selectedBin.clbTokenBalance
        .mul(Math.round(utilizedRate * percentage()))
        .div(expandDecimals(FEE_RATE_DECIMAL))
    : bigNumberify(0);
  const removable = isValid(selectedBin)
    ? selectedBin?.clbTokenBalance
        .mul(Math.round(selectedBin.removableRate * percentage()))
        .div(expandDecimals(FEE_RATE_DECIMAL))
    : bigNumberify(0);

  const { onRemoveLiquidity } = useRemoveLiquidity({
    feeRate: selectedBin?.baseFeeRate,
    amount,
  });

  return (
    <Dialog
      className=""
      open={!!selectedBin}
      onClose={() => {
        dispatch(poolsAction.onBinsReset());
      }}
    >
      {/* backdrop */}
      <div className="fixed inset-0 bg-white/80" aria-hidden="true" />
      <div className="z-40 fixed inset-0 flex items-center justify-center p-4 shadow-xl">
        <Dialog.Panel className="modal bg-white w-full max-w-[500px]">
          <Dialog.Title className="modal-title">
            Remove Liquidity
            <ModalCloseButton
              onClick={() => {
                dispatch(poolsAction.onBinsReset());
              }}
            />
          </Dialog.Title>
          {/* <div className="w-[100px] mx-auto border-b border-2 border-black"></div> */}
          <Dialog.Description className="gap-5 modal-content">
            {/* liquidity items */}
            <article className="flex flex-col border border-gray rounded-xl">
              <LiquidityItem
                token={token?.name}
                name={selectedBin?.clbTokenDescription}
                qty={Number(formatDecimals(balance, selectedBin?.clbTokenDecimals, 2))}
                utilizedValue={Number(formatDecimals(utilized, selectedBin?.clbTokenDecimals, 2))}
                removableValue={Number(formatDecimals(removable, selectedBin?.clbTokenDecimals, 2))}
              />
            </article>

            {/* info bottom */}
            <article className="flex flex-col gap-2 pb-5 border-b">
              <div className="flex justify-between">
                <p className="flex text-black/30">
                  My Liquidity Value
                  <TooltipGuide
                    label="my-liquidity-value"
                    tip="The value of my CLB tokens converted into the current token value."
                  />
                </p>
                {selectedBin && (
                  <p>
                    {formatDecimals(selectedBin.binValue, token?.decimals, 2)} {token?.name}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <p className="flex text-black/30">
                  Removable Liquidity
                  <TooltipGuide
                    label="removable-liquidity"
                    tip="The amount of liquidity that is currently removable due to not being utilized."
                    outLink="#"
                  />
                </p>
                {selectedBin && token && (
                  <p>
                    {formatDecimals(selectedBin.freeLiquidity, token.decimals, 2)} {token.name}
                    <span className="ml-1 text-black/30">({selectedBin.removableRate}%)</span>
                  </p>
                )}
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
                    onClick={() => {
                      onMaxChange?.();
                    }}
                  />
                  <Button
                    className="flex-auto shadow-base border-gray"
                    label="Removable"
                    size="sm"
                    onClick={() => {
                      if (!isValid(selectedBin)) {
                        return;
                      }
                      const nextAmount = selectedBin.binValue.lt(selectedBin.freeLiquidity)
                        ? selectedBin.binValue
                        : selectedBin.freeLiquidity;
                      onAmountChange?.(nextAmount.div(expandDecimals(token?.decimals)).toNumber());
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
                    {selectedBin &&
                      amount &&
                      formatDecimals(
                        bigNumberify(amount)
                          .mul(Math.round(selectedBin.clbTokenValue * 10 ** 2))
                          .div(10 ** 2),
                        0,
                        2
                      )}{' '}
                    {token?.name})
                  </p>
                  <Input
                    unit="CLB"
                    value={amount}
                    onChange={(event) => {
                      let value = event.target.value;
                      value = value.replace(/,/g, '');
                      const trimmed = trimLeftZero(value);
                      const parsed = Number(trimmed);
                      if (isNaN(parsed)) {
                        return;
                      }
                      onAmountChange?.(parsed);
                    }}
                    onClickAway={() => {
                      if (!isValid(amount) || !isValid(maxAmount)) {
                        return;
                      }
                      if (amount > maxAmount) {
                        onMaxChange?.();
                      }
                    }}
                  />
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
              onClick={async () => {
                if (isValid(selectedBin) && isValid(amount)) {
                  onRemoveLiquidity();
                  onAmountChange?.(0);
                }
              }}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
