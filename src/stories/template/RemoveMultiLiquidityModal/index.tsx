import '~/stories/template/Modal/style.css';

import { Dialog } from '@headlessui/react';
import { Button } from '~/stories/atom/Button';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';
import { Outlink } from '~/stories/atom/Outlink';
import { ScrollTrigger } from '~/stories/atom/ScrollTrigger';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { LiquidityItems } from '~/stories/molecule/LiquidityItems';

import { useRemoveMultiLiquidityModal } from './hooks';

export function RemoveMultiLiquidityModal() {
  const {
    isOpen,
    onClose,

    selectedBinsCount,

    tokenName,
    totalClb,
    totalLiquidityValue,
    removableLiquidity,
    removableRate,

    removeAmount,
    onClickAll,
    // onClickRemovable,

    onClickSubmit,
  } = useRemoveMultiLiquidityModal();

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="backdrop" aria-hidden="true" />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 shadow-xl">
        <Dialog.Panel className="modal modal-base">
          <Dialog.Title className="modal-title">
            Remove Liquidity
            <span className="ml-2">({selectedBinsCount})</span>
            <ModalCloseButton onClick={onClose} />
          </Dialog.Title>
          {/* <div className="w-[100px] mx-auto border-b border-2 !border-primary"></div> */}
          <Dialog.Description className="modal-content">
            <article className="mb-6 modal-box">
              <LiquidityItems />
            </article>

            <article className="flex flex-col gap-2 pb-3 mb-3 border-b">
              <div className="flex justify-between">
                <div className="flex text-primary-light">
                  <p>Total CLB</p>
                  <TooltipGuide
                    label="RemoveMultiLiquidityModal-total-clb"
                    tip="The sum of the quantity of the above liquidity tokens(CLB)."
                  />
                </div>
                <p>{totalClb} CLB</p>
              </div>
              <div className="flex justify-between">
                <div className="flex text-primary-light">
                  <p>Total Liquidity Value</p>
                  <TooltipGuide
                    label="RemoveMultiLiquidityModal-total-liquidity-value"
                    tip="The total value of the above liquidity tokens(CLB), converted into the current value."
                  />
                </div>
                <p>
                  {totalLiquidityValue} {tokenName}
                </p>
              </div>
              <div className="flex justify-between">
                <div className="flex text-primary-light">
                  <p>Removable Liquidity</p>
                  <TooltipGuide
                    label="RemoveMultiLiquidityModal-removable-liquidity"
                    tip="The amount of liquidity that is currently removable due to not being utilized."
                    outLink="https://chromatic-protocol.gitbook.io/docs/liquidity/withdraw-liquidity"
                  />
                </div>
                <p>
                  {removableLiquidity} {tokenName}
                  <span className="ml-1 text-primary-light">({removableRate}%)</span>
                </p>
              </div>
            </article>

            {/* input - number */}
            <article className="">
              <div className="flex items-center justify-between gap-2">
                <p className="flex-none font-semibold">Remove CLB Tokens</p>
                <p className="text-right text-primary-light">
                  {totalLiquidityValue} {tokenName}
                </p>
              </div>
              <div className="flex items-center justify-between gap-6 mt-2">
                <div className="flex gap-1">
                  <Button
                    className="flex-auto shadow-base"
                    label="All"
                    css="default"
                    size="sm"
                    onClick={onClickAll}
                  />
                  {/* <Button
                    className="flex-auto shadow-base"
                    label="Removable"
                    css="default"
                    size="sm"
                    onClick={onClickRemovable}
                  /> */}
                </div>
                <div className="max-w-[220px] relative">
                  <p className="text-lg font-semibold text-primary">{removeAmount} CLB</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-primary-lighter">
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
              onClick={onClickSubmit}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
