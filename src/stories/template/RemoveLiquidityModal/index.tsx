import '~/stories/template/Modal/style.css';

import { Dialog } from '@headlessui/react';
import { Button } from '~/stories/atom/Button';
import { Input } from '~/stories/atom/Input';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';
import { Outlink } from '~/stories/atom/Outlink';
import { TooltipAlert } from '~/stories/atom/TooltipAlert';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { LiquidityItem } from '~/stories/molecule/LiquidityItem';

import { useRemoveLiquidityModal } from './hooks';

export function RemoveLiquidityModal() {
  const {
    open,
    onClose,

    tokenName,
    liquidityValue,
    removableLiquidity,
    removableRate,
    tokenAmount,

    onClickAll,

    amount,
    maxAmount,
    onAmountChange,
    isExceeded,

    onClickRemove,

    liquidityItemProps,
  } = useRemoveLiquidityModal();

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="backdrop" aria-hidden="true" />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 shadow-xl">
        <Dialog.Panel className="modal modal-base">
          <Dialog.Title className="modal-title">
            Remove Liquidity
            <ModalCloseButton onClick={onClose} />
          </Dialog.Title>
          {/* <div className="w-[100px] mx-auto border-b border-2 !border-primary"></div> */}
          <Dialog.Description className="gap-5 modal-content">
            <article className="wrapper-liq">
              <LiquidityItem {...liquidityItemProps} />
            </article>

            <article className="flex flex-col gap-2 pb-5 border-b">
              <div className="flex justify-between">
                <div className="flex text-primary-lighter">
                  My Liquidity Value
                  <TooltipGuide
                    label="RemoveLiquidityModal-my-liquidity-value"
                    tip="The value of my CLB tokens converted into the current token value."
                  />
                </div>
                <p>
                  {liquidityValue} {tokenName}
                </p>
              </div>

              <div className="flex justify-between">
                <div className="flex text-primary-lighter">
                  Removable Liquidity
                  <TooltipGuide
                    label="RemoveLiquidityModal-removable-liquidity"
                    tip="The amount of liquidity that is currently removable due to not being utilized."
                    outLink="https://chromatic-protocol.gitbook.io/docs/liquidity/withdraw-liquidity"
                  />
                </div>
                <p>
                  {removableLiquidity} {tokenName}
                  <span className="ml-1 text-primary-lighter">({removableRate}%)</span>
                </p>
              </div>
            </article>

            <article className="">
              <div className="flex items-center justify-between gap-2">
                <p className="flex-none font-semibold">Remove CLB Tokens</p>
                <p className="text-right text-primary-lighter">
                  ({tokenAmount} {tokenName})
                </p>
              </div>
              <div className="flex items-center justify-between gap-6 mt-3">
                <div className="flex gap-1">
                  <Button
                    className="flex-auto shadow-base"
                    label="All"
                    css="default"
                    size="sm"
                    onClick={onClickAll}
                  />
                </div>
                <div className="max-w-[220px]">
                  <div className="tooltip-modal-input-clb">
                    <Input
                      unit="CLB"
                      placeholder="0"
                      autoCorrect
                      max={maxAmount}
                      value={amount}
                      onChange={onAmountChange}
                      error={isExceeded}
                    />
                    {isExceeded && (
                      <TooltipAlert
                        label="modal-input-clb"
                        tip="Exceeded your removable liquidity."
                      />
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-primary-lighter">
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
              onClick={onClickRemove}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
