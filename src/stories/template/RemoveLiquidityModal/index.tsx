import { Dialog } from '@headlessui/react';
import { parseUnits } from 'viem';
import { useRemoveLiquidity } from '~/hooks/useRemoveLiquidity';
import { useAppDispatch } from '~/store';
import { poolsAction } from '~/store/reducer/pools';
import { Input } from '~/stories/atom/Input';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';
import { Outlink } from '~/stories/atom/Outlink';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { LiquidityItem } from '~/stories/molecule/LiquidityItem';
import { Token } from '~/typings/market';
import { OwnedBin } from '~/typings/pools';
import { formatDecimals } from '~/utils/number';
import { isValid } from '~/utils/valid';
import { Button } from '../../atom/Button';
import '../Modal/style.css';

export interface RemoveLiquidityModalProps {
  selectedBin?: OwnedBin;
  token?: Token;
  amount?: string;
  maxAmount?: bigint;
  onAmountChange?: (nextAmount: string | bigint) => unknown;
}

const formatter = Intl.NumberFormat('en', { useGrouping: false });

export const RemoveLiquidityModal = (props: RemoveLiquidityModalProps) => {
  const { selectedBin, token, amount = '', maxAmount, onAmountChange } = props;
  const dispatch = useAppDispatch();
  const { onRemoveLiquidity } = useRemoveLiquidity({
    feeRate: selectedBin?.baseFeeRate,
    amount,
  });

  return (
    <Dialog
      className=""
      open={!!selectedBin}
      onClose={() => {
        onAmountChange?.('');
        dispatch(poolsAction.onBinsReset());
      }}
    >
      {/* backdrop */}
      <div className="fixed inset-0 bg-white/80" aria-hidden="true" />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 shadow-xl">
        <Dialog.Panel className="modal modal-base">
          <Dialog.Title className="modal-title">
            Remove Liquidity
            <ModalCloseButton
              onClick={() => {
                onAmountChange?.('');
                dispatch(poolsAction.onBinsReset());
              }}
            />
          </Dialog.Title>
          {/* <div className="w-[100px] mx-auto border-b border-2 border-black"></div> */}
          <Dialog.Description className="gap-5 modal-content">
            {/* liquidity items */}
            <article className="flex flex-col border border-gray rounded-xl">
              <LiquidityItem
                token={token}
                name={selectedBin?.clbTokenDescription}
                bin={selectedBin}
              />
            </article>

            {/* info bottom */}
            <article className="flex flex-col gap-2 pb-5 border-b">
              <div className="flex justify-between">
                <p className="flex text-black/30">
                  My Liquidity Value
                  <TooltipGuide
                    label="RemoveLiquidityModal-my-liquidity-value"
                    tip="The value of my CLB tokens converted into the current token value."
                  />
                </p>
                {selectedBin && (
                  <p>
                    {formatDecimals(selectedBin.clbBalanceOfSettlement, token?.decimals, 2)}{' '}
                    {token?.name}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <p className="flex text-black/30">
                  Removable Liquidity
                  <TooltipGuide
                    label="RemoveLiquidityModal-removable-liquidity"
                    tip="The amount of liquidity that is currently removable due to not being utilized."
                    outLink="https://chromatic-protocol.gitbook.io/docs/liquidity/withdraw-liquidity"
                  />
                </p>
                {selectedBin && token && (
                  <p>
                    {formatDecimals(selectedBin.freeLiquidity, token.decimals, 2)} {token.name}
                    <span className="ml-1 text-black/30">
                      ({formatDecimals(selectedBin.removableRate, token.decimals - 2, 2)}%)
                    </span>
                  </p>
                )}
              </div>
            </article>

            {/* input - number */}
            <article className="">
              <div className="flex items-center justify-between gap-2">
                <p className="flex-none font-semibold">Remove CLB Tokens</p>
                <p className="text-right text-black/30">
                  {/**
                   * @TODO
                   * 사용자가 입력한 제거 하려는 LP 토큰의 개수에 대해서 USDC 값으로 변환하는 로직입니다.
                   */}
                  (
                  {selectedBin &&
                    formatDecimals(
                      parseUnits(formatter.format(Number(amount)), selectedBin.clbTokenDecimals) *
                        selectedBin?.clbTokenValue,
                      selectedBin.clbTokenDecimals * 2,
                      2
                    )}{' '}
                  {token?.name})
                </p>
              </div>
              <div className="flex items-center justify-between gap-6 mt-3">
                <div className="flex gap-1">
                  <Button
                    className="flex-auto shadow-base border-gray"
                    label="All"
                    size="sm"
                    onClick={() => {
                      onAmountChange?.(maxAmount ?? 0n);
                    }}
                  />
                </div>
                <div className="max-w-[220px]">
                  {/* todo: input error */}
                  {/* - Input : error prop is true when has error */}
                  {/* - TooltipAlert : is shown when has error */}
                  <div className="tooltip-modal-input-clb">
                    <Input
                      unit="CLB"
                      placeholder="0"
                      autoCorrect
                      max={Number(maxAmount)}
                      value={amount}
                      onChange={(value) => {
                        onAmountChange?.(value);
                      }}
                      // error
                    />
                    {/* <TooltipAlert
                      label="modal-input-clb"
                      tip="Exceeded your removable liquidity."
                    /> */}
                  </div>
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
              onClick={async () => {
                if (isValid(selectedBin) && isValid(amount)) {
                  onRemoveLiquidity();
                  onAmountChange?.('0');
                }
              }}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
