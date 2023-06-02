import { Popover } from "@headlessui/react";
import { Avatar } from "../../atom/Avatar";
import { Button } from "../../atom/Button";
import { OptionInput } from "../../atom/OptionInput";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { ChevronDoubleUpIcon } from "@heroicons/react/20/solid";
import "./style.css";
import { Account } from "../../../typings/account";
import { Token } from "../../../typings/market";
import {
  expandDecimals,
  formatDecimals,
  withComma,
} from "../../../utils/number";
import { BigNumber } from "ethers";
import { isValid } from "../../../utils/valid";

interface AssetPopoverProps {
  // onClick?: () => void;
  account?: Account;
  token?: Token;
  walletBalances?: Record<string, BigNumber>;
  usumBalances?: Record<string, BigNumber>;
  amount?: string;
  onAmountChange?: (value: string) => unknown;
  onDeposit?: () => unknown;
  onWithdraw?: () => unknown;
  onConnect?: () => void;
}

export const AssetPopover = ({
  account,
  token,
  walletBalances,
  usumBalances,
  amount,
  onAmountChange,
  onDeposit,
  onWithdraw,
  onConnect,
  ...props
}: AssetPopoverProps) => {
  const isLoaded = isValid(account) && isValid(token);
  return (
    <div className="AssetPopover relative flex items-center justify-between gap-6 border rounded-2xl w-full max-w-[500px] min-h-[100px]">
      <div className="ml-10">
        <Avatar size="sm" fontSize="lg" label="Asset balance" gap="2" />
      </div>
      <div className="flex flex-col gap-2 mr-10 text-right">
        {isLoaded ? (
          <>
            <h2 className="text-2xl">
              {token &&
                usumBalances &&
                withComma(
                  formatDecimals(usumBalances[token.name], token.decimals, 2)
                )}
            </h2>
            <Popover.Group className="flex gap-3">
              <Popover>
                {({ open }) => (
                  <>
                    <Popover.Button
                      className={`btn btn-default btn-sm ${
                        open ? "border-black" : null
                      }`}
                    >
                      Deposit
                    </Popover.Button>
                    <Popover.Panel className="popover-panel">
                      <div className="w-full gap-2 pt-2">
                        <article className="relative flex items-center gap-4 p-4 overflow-hidden border rounded-xl bg-grayL/20">
                          <p className="flex-none pr-4 border-r text-black/30">
                            My Account
                          </p>
                          <div className="w-[calc(100%-140px)] overflow-hidden overflow-ellipsis">
                            {account.usumAddress}
                          </div>
                          <Button
                            size="base"
                            css="unstyled"
                            className="absolute right-2"
                            iconOnly={<ArrowTopRightOnSquareIcon />}
                          />
                        </article>
                        <section className="flex mt-5 text-left">
                          {/* Deposit */}
                          <article className="flex flex-col items-start w-2/5 min-w-[140px] gap-3">
                            <h4 className="text-lg font-semibold">Deposit</h4>
                            <div className="px-3 py-2 border rounded-full">
                              <Avatar size="xs" label={token?.name} gap="1" />
                            </div>
                            <div>
                              <p className="mb-1 text-black/30">
                                Available Margin
                              </p>
                              <p>225.23 {token?.name}</p>
                            </div>
                            <div>
                              <p className="mb-1 text-black/30">Asset Value</p>
                              <p>3,025.23 {token?.name}</p>
                            </div>
                          </article>
                          {/* Account */}
                          <article className="flex flex-col w-3/5 gap-3 border-l ml-7 pl-7">
                            <h4 className="text-lg font-semibold">Amount</h4>
                            <OptionInput
                              value={amount}
                              maxValue={walletBalances?.[token.name]
                                ?.div(expandDecimals(token.decimals))
                                .toString()}
                              onChange={(event) => {
                                event.preventDefault();
                                onAmountChange?.(event.target.value);
                              }}
                              onButtonClick={(value) => {
                                onAmountChange?.(value);
                              }}
                            />
                            <p className="text-xs text-black/30">
                              Please set additional values to apply to the basic
                              formula in Borrow Fee. Calculated based on open
                              Interest and stop profit/Loss rate.
                            </p>
                          </article>
                        </section>
                        <div className="mt-6 text-center">
                          <Button
                            label="Deposit"
                            size="xl"
                            css="active"
                            className="w-full"
                            onClick={onDeposit}
                          />
                          <Button
                            iconOnly={<ChevronDoubleUpIcon />}
                            size="sm"
                            css="unstyled"
                            className="w-full my-2"
                          />
                        </div>
                      </div>
                    </Popover.Panel>
                  </>
                )}
              </Popover>
              <AssetPanel title="Deposit" />
              <Popover>
                {({ open }) => (
                  <>
                    <Popover.Button
                      className={`btn btn-default btn-sm ${
                        open ? "border-black" : null
                      }`}
                    >
                      Withdraw
                    </Popover.Button>
                    {/* Deposit popover-panel 구성요소와 동일 */}
                    <Popover.Panel className="popover-panel">
                      <div className="w-full gap-2 pt-2">
                        <article className="flex items-center gap-4 p-4 overflow-hidden border rounded-xl">
                          <p className="flex-none text-black/50">My Account</p>
                          <div className="flex items-center gap-2">
                            <div className="shrink max-w-[45%] overflow-hidden">
                              <p className="inline-block overflow-ellipsis">
                                {account.usumAddress}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              css="unstyled"
                              iconOnly={<ArrowTopRightOnSquareIcon />}
                            />
                          </div>
                        </article>
                        <section className="flex mt-5 text-left">
                          <article className="flex flex-col gap-4">
                            <h2>Withdraw</h2>
                            <Avatar size="xs" label={token?.name} gap="1" />
                            <div>
                              <h4 className="mb-2">Asset Value</h4>
                              <p>2,025.23 {token?.name}</p>
                            </div>
                            <div>
                              <h4 className="mb-2">Available Margin</h4>
                              <p>125.23 {token?.name}</p>
                            </div>
                          </article>
                          <article className="flex flex-col gap-4 max-w-[220px] ml-7 pl-7 border-l">
                            <h2>Amount</h2>
                            <OptionInput
                              value={amount}
                              maxValue={usumBalances?.[token.name]
                                ?.div(expandDecimals(token.decimals))
                                .toString()}
                              onChange={(event) => {
                                event.preventDefault();
                                onAmountChange?.(event.target.value);
                              }}
                              onButtonClick={(value) => {
                                onAmountChange?.(value);
                              }}
                            />
                            <p className="text-sm text-black/30">
                              Please set additional values to apply to the basic
                              formula in Borrow Fee. Calculated based on open
                              Interest and stop profit/Loss rate.
                            </p>
                          </article>
                        </section>
                        <div className="mt-6 mb-3 text-center">
                          <Button
                            label="Withdraw"
                            size="lg"
                            className="w-full"
                            onClick={() => onWithdraw?.()}
                          />
                          <Button
                            iconOnly={<ChevronDoubleUpIcon />}
                            size="sm"
                            css="unstyled"
                            className="mt-3"
                          />
                        </div>
                      </div>
                    </Popover.Panel>
                  </>
                )}
              </Popover>
            </Popover.Group>
          </>
        ) : (
          <>
            <Button label="Connect Wallet" size="sm" />
          </>
        )}
      </div>
    </div>
  );
};
