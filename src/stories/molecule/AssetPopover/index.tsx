import { Popover } from "@headlessui/react";
import { Avatar } from "../../atom/Avatar";
import { Button } from "../../atom/Button";
import { OptionInput } from "../../atom/OptionInput";
import { Loading } from "~/stories/atom/Loading";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { ChevronDoubleUpIcon } from "@heroicons/react/20/solid";
import { CheckIcon } from "@heroicons/react/20/solid";
import "./style.css";
import {
  ACCOUNT_COMPLETED,
  ACCOUNT_COMPLETING,
  ACCOUNT_CREATING,
  ACCOUNT_NONE,
  ACCOUNT_STATUS,
  Account,
} from "../../../typings/account";
import { Token } from "../../../typings/market";
import {
  bigNumberify,
  expandDecimals,
  formatDecimals,
  withComma,
} from "../../../utils/number";
import { BigNumber } from "ethers";
import { isValid } from "../../../utils/valid";

interface AssetPopoverProps {
  // onClick?: () => void;
  account?: Account;
  status?: ACCOUNT_STATUS;
  token?: Token;
  walletBalances?: Record<string, BigNumber>;
  usumBalances?: Record<string, BigNumber>;
  amount?: string;
  totalBalance?: BigNumber;
  availableMargin?: BigNumber;
  assetValue?: BigNumber;
  onAmountChange?: (value: string) => unknown;
  onDeposit?: () => unknown;
  onWithdraw?: () => unknown;
  onConnect?: () => void;
  onStatusUpdate?: () => unknown;
}

export const AssetPopover = ({
  account,
  status,
  token,
  walletBalances,
  usumBalances,
  amount,
  totalBalance,
  availableMargin,
  assetValue,
  onAmountChange,
  onDeposit,
  onWithdraw,
  onConnect,
  onStatusUpdate,
  ...props
}: AssetPopoverProps) => {
  const isLoaded = isValid(account) && isValid(token);
  return (
    <div className="AssetPopover relative flex items-center justify-between gap-6 border rounded-2xl min-h-[100px]">
      <div className="ml-10">
        <Avatar size="sm" fontSize="lg" label="Asset balance" gap="2" />
      </div>
      <div className="flex flex-col gap-2 mr-10 text-right">
        {isLoaded ? (
          <>
            <h2 className="text-2xl">
              {totalBalance &&
                withComma(formatDecimals(totalBalance, token.decimals, 2))}
            </h2>
            <Popover.Group className="flex gap-3">
              <AssetPanel
                title="Deposit"
                account={account}
                status={status}
                token={token}
                walletBalances={walletBalances}
                usumBalances={usumBalances}
                amount={amount}
                availableMargin={availableMargin}
                assetValue={assetValue}
                onAmountChange={onAmountChange}
                onDeposit={onDeposit}
                onWithdraw={onWithdraw}
                onStatusUpdate={onStatusUpdate}
              />
              <AssetPanel
                title="Withdraw"
                account={account}
                status={status}
                token={token}
                walletBalances={walletBalances}
                usumBalances={usumBalances}
                amount={amount}
                availableMargin={availableMargin}
                assetValue={assetValue}
                onAmountChange={onAmountChange}
                onDeposit={onDeposit}
                onWithdraw={onWithdraw}
                onStatusUpdate={onStatusUpdate}
              />
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

interface AssetPanelProps {
  account?: Account;
  status?: ACCOUNT_STATUS;
  token?: Token;
  walletBalances?: Record<string, BigNumber>;
  usumBalances?: Record<string, BigNumber>;
  amount?: string;
  availableMargin?: BigNumber;
  assetValue?: BigNumber;
  onAmountChange?: (value: string) => unknown;
  onDeposit?: () => unknown;
  onWithdraw?: () => unknown;
  onStatusUpdate?: () => unknown;
  title: string;
}

const AssetPanel = (props: AssetPanelProps) => {
  const {
    title,
    account,
    status,
    token,
    walletBalances,
    usumBalances,
    amount,
    availableMargin = bigNumberify(0),
    assetValue = bigNumberify(0),
    onAmountChange,
    onDeposit,
    onWithdraw,
    onStatusUpdate,
  } = props;

  return (
    <Popover>
      {({ open, close }) => (
        <>
          <Popover.Button
            className={`btn btn-default btn-sm ${open ? "border-black" : null}`}
          >
            {title}
          </Popover.Button>
          {/* account 없을 때 */}
          {/* 1. create account */}
          {status === ACCOUNT_NONE && (
            <Popover.Panel className="popover-panel">
              <div className="w-full gap-2 pt-2 text-center">
                <article className="relative flex flex-col items-center gap-4 px-5 pt-6 pb-8 overflow-hidden border rounded-xl bg-grayL/20">
                  <img
                    src="/src/assets/images/i_create_account_xl.svg"
                    alt="create account"
                  />
                  <p>
                    To make a deposit, you need to <br />
                    create account first
                  </p>
                </article>
                <div className="my-7">
                  <p className="text-black/50">
                    This process may take approximately 10 seconds or more.
                  </p>
                </div>
                <div className="text-center">
                  <Button
                    label="Create Account"
                    size="xl"
                    css="active"
                    className="w-full"
                    onClick={() => {
                      onStatusUpdate?.();
                    }}
                  />
                  <Button
                    iconOnly={<ChevronDoubleUpIcon />}
                    size="sm"
                    css="unstyled"
                    className="w-full my-2"
                    onClick={() => {
                      close();
                    }}
                  />
                </div>
              </div>
            </Popover.Panel>
          )}

          {/* account 없을 때 */}
          {/* 2. loading to generate account */}
          {status === ACCOUNT_CREATING && (
            <Popover.Panel className="popover-panel">
              <div className="w-full gap-2 pt-2 text-center">
                <article className="relative flex flex-col items-center gap-4 px-5 pt-6 pb-8 overflow-hidden border rounded-xl bg-grayL/20">
                  <img
                    src="/src/assets/images/i_loading_xl.svg"
                    alt="creating account"
                    className="animate-spin-slow"
                  />
                  <p>
                    The account addtress is being generated <br /> on the chain
                  </p>
                </article>
                <div className="my-7">
                  <p className="text-black/50">
                    This process may take approximately 10 seconds or more.
                  </p>
                </div>
                <div className="text-center">
                  <Button
                    label="Create Account"
                    iconRight={<Loading />}
                    size="xl"
                    css="active"
                    className="w-full"
                    disabled={true}
                  />
                  <Button
                    iconOnly={<ChevronDoubleUpIcon />}
                    size="sm"
                    css="unstyled"
                    className="w-full my-2"
                    onClick={() => {
                      close();
                    }}
                  />
                </div>
              </div>
            </Popover.Panel>
          )}

          {/* account 없을 때 */}
          {/* 3. complete to create account */}
          {/* todo: 3초 정도 보여지고, account 있을 때의 UI로 자연스럽게 전환됨 */}
          {status === ACCOUNT_COMPLETING && (
            <Popover.Panel className="popover-panel">
              <div className="w-full gap-2 pt-2 text-center">
                <article className="relative flex flex-col items-center gap-4 px-5 pt-6 pb-8 overflow-hidden border rounded-xl bg-grayL/20">
                  <img
                    src="/src/assets/images/i_check_xl.svg"
                    alt="creating account"
                  />
                  <p>Account has been created</p>
                </article>
                <div className="py-8"></div>
                <div className="text-center">
                  <Button
                    label="Create Account"
                    iconRight={<CheckIcon />}
                    size="xl"
                    css="active"
                    className="w-full"
                    disabled={true}
                  />
                  <Button
                    iconOnly={<ChevronDoubleUpIcon />}
                    size="sm"
                    css="unstyled"
                    className="w-full my-2"
                    onClick={() => {
                      close();
                    }}
                  />
                </div>
              </div>
            </Popover.Panel>
          )}

          {/* account 있을 때 */}
          {status === ACCOUNT_COMPLETED && (
            <Popover.Panel className="popover-panel">
              <div className="w-full gap-2 pt-2">
                <article className="relative flex items-center gap-4 p-4 overflow-hidden border rounded-xl bg-grayL/20">
                  <p className="flex-none pr-4 border-r text-black/30">
                    My Account
                  </p>
                  <div className="w-[calc(100%-140px)] overflow-hidden overflow-ellipsis">
                    {account?.usumAddress}
                  </div>
                  <Button
                    size="base"
                    css="unstyled"
                    className="absolute right-2"
                    iconOnly={<ArrowTopRightOnSquareIcon />}
                  />
                </article>
                <section className="flex mt-5 text-left">
                  <article className="flex flex-col items-start w-2/5 min-w-[140px] gap-3">
                    <h4 className="text-lg font-semibold">{title}</h4>
                    <div className="px-3 py-2 border rounded-full">
                      <Avatar size="xs" label={token?.name} gap="1" />
                    </div>
                    <div>
                      <p className="mb-1 text-black/30">Available Margin</p>
                      <p>
                        {formatDecimals(availableMargin, token?.decimals, 2)}{" "}
                        {token?.name}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-black/30">Asset Value</p>
                      <p>
                        {formatDecimals(assetValue, token?.decimals, 2)}{" "}
                        {token?.name}
                      </p>
                    </div>
                  </article>
                  <article className="flex flex-col w-3/5 gap-3 border-l ml-7 pl-7">
                    <h4 className="text-lg font-semibold">Amount</h4>
                    <OptionInput
                      value={amount}
                      maxValue={
                        token &&
                        (title === "Deposit"
                          ? walletBalances?.[token.name]
                              ?.div(expandDecimals(token.decimals))
                              .toString()
                          : usumBalances?.[token.name]
                              ?.div(expandDecimals(token.decimals))
                              .toString())
                      }
                      onChange={(event) => {
                        event.preventDefault();
                        onAmountChange?.(event.target.value);
                      }}
                      onButtonClick={(value) => {
                        onAmountChange?.(value);
                      }}
                    />
                    <p className="text-xs text-black/30">
                      Please set additional values to apply to the basic formula
                      in Borrow Fee. Calculated based on open Interest and stop
                      profit/Loss rate.
                    </p>
                  </article>
                </section>
                <div className="mt-6 text-center">
                  <Button
                    label={title}
                    size="xl"
                    css="active"
                    className="w-full"
                    onClick={() => {
                      if (title === "Deposit") {
                        onDeposit && onDeposit();
                      } else {
                        onWithdraw && onWithdraw();
                      }
                    }}
                  />
                  <Button
                    iconOnly={<ChevronDoubleUpIcon />}
                    size="sm"
                    css="unstyled"
                    className="w-full my-2"
                    onClick={() => {
                      close();
                    }}
                  />
                </div>
              </div>
            </Popover.Panel>
          )}
        </>
      )}
    </Popover>
  );
};
