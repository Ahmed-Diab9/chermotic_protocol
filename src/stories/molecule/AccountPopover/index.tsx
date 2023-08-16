import { Popover } from '@headlessui/react';
import { ArrowTopRightOnSquareIcon, ChevronDoubleUpIcon } from '@heroicons/react/24/outline';
import { isNil, isNotNil } from 'ramda';
import { useEffect, useMemo } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { usePublicClient } from 'wagmi';
import { CompleteLgIcon, CreateLgIcon, LoadingLgIcon } from '~/assets/icons/CreateAccountIcon';
import { useAppDispatch } from '~/store';
import { accountAction } from '~/store/reducer/account';
import { Loading } from '~/stories/atom/Loading';
import { Outlink } from '~/stories/atom/Outlink';
import { TooltipAlert } from '~/stories/atom/TooltipAlert';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { isValid } from '~/utils/valid';
import { ACCOUNT_STATUS, Account } from '../../../typings/account';
import { Token } from '../../../typings/market';
import { formatDecimals, isNotZero } from '../../../utils/number';
import { Avatar } from '../../atom/Avatar';
import { Button } from '../../atom/Button';
import { OptionInput } from '../../atom/OptionInput';
import { SkeletonElement } from '../../atom/SkeletonElement';
import './style.css';

interface AccountPopoverProps {
  // onClick?: () => void;
  account?: Account;
  status?: ACCOUNT_STATUS;
  selectedToken?: Token;
  walletBalances?: Record<string, bigint>;
  chromaticBalances?: Record<string, bigint>;
  amount?: string;
  totalBalance?: bigint;
  availableMargin?: bigint;
  assetValue?: bigint;
  isLoading?: boolean;
  isBalanceLoading?: boolean;
  isConnected?: boolean;
  onAmountChange?: (value: string) => unknown;
  onDeposit?: (onAfterDeposit?: () => unknown) => unknown;
  onWithdraw?: (onAfterWithdraw?: () => unknown) => unknown;
  onConnect?: () => void;
  onStatusUpdate?: () => unknown;
}

export const AccountPopover = ({
  account,
  status,
  selectedToken,
  walletBalances,
  chromaticBalances,
  amount,
  totalBalance,
  availableMargin,
  assetValue,
  isLoading,
  isBalanceLoading,
  isConnected,
  onAmountChange,
  onDeposit,
  onWithdraw,
  onConnect,
  onStatusUpdate,
  ...props
}: AccountPopoverProps) => {
  const isLoaded = isNotNil(account) && isNotNil(selectedToken);

  return (
    <>
      <div className="AccountPopover">
        <div className="ml-10">
          <Avatar size="sm" fontSize="lg" label="Account balance" gap="2" />
        </div>
        <div className="flex flex-col gap-1 mr-10 text-right">
          {isConnected && isLoaded ? (
            <>
              <h2 className="text-xl">
                <SkeletonElement isLoading={isBalanceLoading} width={120}>
                  {isValid(totalBalance) &&
                    formatDecimals(totalBalance, selectedToken.decimals, 2, true) +
                      ` ${selectedToken.name}`}
                </SkeletonElement>
              </h2>
              <Popover.Group className="flex gap-2">
                <AssetPanel
                  title="Deposit"
                  account={account}
                  status={status}
                  token={selectedToken}
                  walletBalances={walletBalances}
                  chromaticBalances={chromaticBalances}
                  amount={amount}
                  availableMargin={availableMargin}
                  assetValue={assetValue}
                  onAmountChange={onAmountChange}
                  onDeposit={onDeposit}
                  onWithdraw={onWithdraw}
                  onStatusUpdate={onStatusUpdate}
                  isLoading={isLoading}
                />
                <AssetPanel
                  title="Withdraw"
                  account={account}
                  status={status}
                  token={selectedToken}
                  walletBalances={walletBalances}
                  chromaticBalances={chromaticBalances}
                  amount={amount}
                  availableMargin={availableMargin}
                  assetValue={assetValue}
                  onAmountChange={onAmountChange}
                  onDeposit={onDeposit}
                  onWithdraw={onWithdraw}
                  onStatusUpdate={onStatusUpdate}
                  isLoading={isLoading}
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
    </>
  );
};

interface AssetPanelProps {
  account?: Account;
  status?: ACCOUNT_STATUS;
  token?: Token;
  walletBalances?: Record<string, bigint>;
  chromaticBalances?: Record<string, bigint>;
  amount?: string;
  availableMargin?: bigint;
  assetValue?: bigint;
  isLoading?: boolean;
  onAmountChange?: (value: string) => unknown;
  onDeposit?: (onAfterDeposit?: () => unknown) => unknown;
  onWithdraw?: (onAfterWithdraw?: () => unknown) => unknown;
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
    chromaticBalances,
    amount,
    availableMargin = BigInt(0),
    assetValue = BigInt(0),
    isLoading,
    onAmountChange,
    onDeposit,
    onWithdraw,
    onStatusUpdate,
  } = props;
  const publicClient = usePublicClient();
  const blockExplorer = useMemo(() => {
    try {
      const rawUrl = publicClient.chain.blockExplorers?.default?.url;
      if (isNil(rawUrl)) {
        return;
      }
      return new URL(rawUrl).origin;
    } catch (error) {
      return;
    }
  }, [publicClient]);

  const dispatch = useAppDispatch();
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined = undefined;
    if (status === ACCOUNT_STATUS.COMPLETING) {
      timerId = setTimeout(() => {
        dispatch(accountAction.setAccountStatus(ACCOUNT_STATUS.COMPLETED));
      }, 3000);
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [status]);

  const isExceeded = useMemo(() => {
    if (!isNotZero(amount)) {
      return false;
    }
    if (
      isNil(walletBalances) ||
      isNil(chromaticBalances) ||
      isNil(amount) ||
      isNil(title) ||
      isNil(token)
    ) {
      return false;
    }
    if (title === 'Deposit') {
      return parseUnits(amount, token.decimals) > walletBalances[token.address];
    }
    if (title === 'Withdraw') {
      return parseUnits(amount, token.decimals) > chromaticBalances[token.address];
    }
    return false;
  }, [amount, title, token, chromaticBalances, walletBalances]);

  const minimum = 10;
  const isLess = useMemo(() => {
    return Number(amount) < minimum && isNotZero(amount);
  }, [amount]);

  return (
    <Popover>
      {({ open, close }) => (
        <>
          <Popover.Button
            className={`btn btn-default btn-sm ${open ? '!border-primary !text-primary' : ''}`}
          >
            {title}
          </Popover.Button>
          {/* account 없을 때 */}
          {/* 1. create account */}
          {status === ACCOUNT_STATUS.NONE && (
            <Popover.Panel className="popover-panel">
              <div className="w-full gap-2 pt-2 text-center">
                <article className="inner-box">
                  <CreateLgIcon />
                  <p>
                    {title === 'Deposit' ? 'To make a deposit' : 'To withdraw an asset'}
                    , you need to <br />
                    create account first.
                  </p>
                </article>
                <div className="my-7">
                  <p className="text-primary-light">
                    This process may take approximately 10 seconds or so.
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
          {status === ACCOUNT_STATUS.CREATING && (
            <Popover.Panel className="popover-panel">
              <div className="w-full gap-2 pt-2 text-center">
                <article className="inner-box">
                  <span className="animate-spin-slow">
                    <LoadingLgIcon />
                  </span>
                  <p>
                    The account address is being generated <br /> on the chain.
                  </p>
                </article>
                <div className="my-7">
                  <p className="text-primary-light">
                    This process may take approximately 10 seconds or so. Please wait a moment.
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
          {status === ACCOUNT_STATUS.COMPLETING && (
            <Popover.Panel className="popover-panel">
              <div className="w-full gap-2 pt-2 text-center">
                <article className="inner-box">
                  <CompleteLgIcon />
                  <p>Account has been created</p>
                </article>
                <div className="text-center">
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
          {status === ACCOUNT_STATUS.COMPLETED && (
            <Popover.Panel className="popover-panel">
              <div className="w-full gap-2 pt-2">
                <article className="relative flex items-center gap-4 p-4 overflow-hidden border rounded-xl bg-paper-lighter">
                  <p className="flex-none pr-4 border-r text-primary-lighter">My Account</p>
                  <div className="w-[calc(100%-140px)] overflow-hidden overflow-ellipsis text-left">
                    {account?.chromaticAddress}
                  </div>
                  <Button
                    href={
                      blockExplorer && account?.chromaticAddress
                        ? `${blockExplorer}/address/${account?.chromaticAddress}`
                        : undefined
                    }
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
                      <div className="flex mb-1 text-primary-lighter">
                        Available Margin
                        <TooltipGuide
                          label="available-margin"
                          tip="Available Margin is the amount that can be immediately withdrawn. Available Margin = Balance - Taker Margin"
                        />
                      </div>
                      <p>
                        <SkeletonElement isLoading={isLoading} width={80}>
                          {formatDecimals(availableMargin, token?.decimals, 5, true)} {token?.name}
                        </SkeletonElement>
                      </p>
                    </div>
                    {/* 
                      Temporary commented out 
                      https://github.com/chromatic-protocol/frontend/issues/290
                    */}
                    {/* <div>
                      <div className="flex mb-1 text-primary-lighter">
                        Asset Value
                        <TooltipGuide
                          label="asset-value"
                          tip="This is the total sum of the asset in my account, including the amount collateralized by taker margin and unrealized PnL."
                        />
                      </div>
                      <p>
                        <SkeletonElement isLoading={isLoading} width={80}>
                          {formatDecimals(assetValue, token?.decimals, 5)} {token?.name}
                        </SkeletonElement>
                      </p>
                    </div> */}
                  </article>
                  <article className="flex flex-col w-3/5 gap-3 border-l ml-7 pl-7">
                    <h4 className="text-lg font-semibold">Amount</h4>
                    {/* todo: input error */}
                    {/* - Input : error prop is true when has error */}
                    {/* - TooltipAlert : is shown when has error */}
                    <div className="tooltip-input-amount">
                      <OptionInput
                        value={amount}
                        maxValue={
                          token &&
                          (title === 'Deposit'
                            ? formatUnits(walletBalances?.[token.address] ?? 0n, token?.decimals)
                            : formatUnits(
                                chromaticBalances?.[token.address] ?? 0n,
                                token?.decimals
                              ))
                        }
                        onChange={(value) => {
                          onAmountChange?.(value);
                        }}
                        onButtonClick={(value) => {
                          onAmountChange?.(value);
                        }}
                        className="w-full"
                        error={isExceeded || isLess}
                      />
                      {/* case 1. exceeded */}
                      {isExceeded && (
                        <TooltipAlert
                          label="input-amount"
                          tip={
                            title === 'Deposit'
                              ? 'Exceeded your wallet balance.'
                              : 'Exceeded the available margin.'
                          }
                        />
                      )}
                      {/* case 2. less than minimum */}
                      {/* FIXME Minimum value needed */}
                      {isLess && (
                        <TooltipAlert
                          label="input-amount"
                          tip={`Less than minimum amount. (${minimum})`}
                        />
                      )}
                    </div>
                    <div className="text-sm">
                      <p className="mb-1 text-primary-lighter">
                        To open a position in the Chromatic Protocol, you need to deposit the
                        required amount of settlement assets into your account.{' '}
                        <Outlink outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement" />
                      </p>
                    </div>
                  </article>
                </section>
                <div className="mt-6 text-center">
                  <Button
                    label={title}
                    size="xl"
                    css="active"
                    className="w-full"
                    onClick={() => {
                      if (title === 'Deposit') {
                        onDeposit && onDeposit(close);
                      } else {
                        onWithdraw && onWithdraw(close);
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
