import './style.css';

import { Tab } from '@headlessui/react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import { CompleteLgIcon, CreateLgIcon, LoadingLgIcon } from '~/assets/icons/CreateAccountIcon';
import { OutlinkIcon } from '~/assets/icons/Icon';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { Loading } from '~/stories/atom/Loading';
import { OptionInput } from '~/stories/atom/OptionInput';
import { Outlink } from '~/stories/atom/Outlink';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';

import { useAccountPanelV3 } from './hooks';

export interface AccountPanelV3Props {
  // FIXME: `type` is not needed here
  type?: 'Deposit' | 'Withdraw';
  onPanelClose?: () => unknown;
}

export const AccountPanelV3 = (props: AccountPanelV3Props) => {
  const {
    isDeposit,

    isAccountNotExist,
    isAccountCreating,
    isAccountCreated,
    isAccountExist,

    tokenName,
    tokenImage,
    availableMargin,
    walletBalance,
    onClickCreateAccount,
  } = useAccountPanelV3(props);
  const { onPanelClose } = props;

  return (
    <div className="AccountPanelV3">
      {/* 1. create account */}
      {isAccountNotExist && (
        <div className="w-full gap-2 text-center">
          <article className="inner-box">
            <CreateLgIcon />
            <div>
              {isDeposit ? 'To make a deposit' : 'To withdraw an asset'}
              , you need to <br />
              create account first.
            </div>
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
              onClick={onClickCreateAccount}
            />
          </div>
        </div>
      )}

      {/* 2. loading to generate account */}
      {isAccountCreating && (
        <div className="w-full gap-2 text-center">
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
              This process may take approximately 10 seconds or so. <br />
              Please wait a moment.
            </p>
          </div>
          <div className="text-center">
            <Button
              label="Create Account"
              iconRight={<Loading />}
              size="xl"
              css="active"
              className="w-full"
              disabled
            />
          </div>
        </div>
      )}

      {/* 3. complete to create account */}
      {isAccountCreated && (
        <div className="w-full gap-2 text-center">
          <article className="inner-box">
            <CompleteLgIcon />
            <p>Account has been created</p>
          </article>
        </div>
      )}

      {isAccountExist && (
        <>
          <div className="w-full wrapper-tabs">
            {/* <Tab.Group selectedIndex={selectedTab} onChange={onSelectTab}> */}
            <Tab.Group>
              <Tab.List className="flex flex-col w-full mb-5 tabs-list">
                <div className="px-5 -mx-5 -mt-1 border-b">
                  <div className="flex items-baseline gap-3 pb-3 text-left">
                    <p className="flex items-center mb-1 text-primary-lighter">Wallet Balance</p>
                    <h5 className="text-xl">
                      <SkeletonElement
                        // isLoading={isLoading}
                        width={80}
                      >
                        {/* TODO: show wallet balance */}
                        {walletBalance} {tokenName}
                      </SkeletonElement>
                    </h5>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full pt-4">
                  <div className="">
                    <div className="flex mb-1 text-primary-lighter">
                      <h4 className="text-left">Account Available Margin</h4>
                      <TooltipGuide
                        label="available-margin"
                        tip="Available Margin is the amount that can be immediately withdrawn. Available Margin = Balance - Taker Margin"
                      />
                    </div>
                    <Avatar
                      // label={balance}
                      label={`${availableMargin} ${tokenName}`}
                      fontSize="3xl"
                      src={tokenImage}
                    />
                  </div>
                  <div className="flex gap-3 ml-auto">
                    <Tab value="short" className="btn-tab btn-sm btn btn-line">
                      <ArrowDownIcon className="w-3 h-3 mr-1 -ml-1" />
                      <span>Deposit</span>
                    </Tab>
                    <Tab value="long" className="btn-tab btn-sm btn btn-line">
                      <ArrowUpIcon className="w-3 h-3 mr-1 -ml-1" />
                      <span>Withdraw</span>
                    </Tab>
                  </div>
                </div>
              </Tab.List>
              <Tab.Panels className="flex flex-col items-center w-full">
                <Tab.Panel className="w-full">
                  <AccountManagementV3 type="Deposit" onClose={onPanelClose} />
                </Tab.Panel>
                <Tab.Panel className="w-full">
                  <AccountManagementV3 type="Withdraw" onClose={onPanelClose} />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </>
      )}
    </div>
  );
};

export interface AccountManagementV3Props {
  type: 'Deposit' | 'Withdraw';
  onClose?: () => unknown;
}

export const AccountManagementV3 = (props: AccountManagementV3Props) => {
  const {
    isLoading,

    isDeposit,

    chromaticAddress,
    addressExplorer,
    tokenName,
    tokenImage,
    balance,

    maxAmount,
    minimumAmount,
    isAmountError,
    isSubmitDisabled,
    isExceeded,
    isLess,

    amount,
    onAmountChange,

    onClickSubmit,
  } = useAccountPanelV3(props);
  const { type, onClose } = props;

  return (
    <div className="w-full gap-2">
      <article className="relative flex items-center gap-4 p-3 overflow-hidden border rounded-xl bg-paper-lighter">
        <p className="flex-none pr-4 border-r text-primary-lighter">My Account</p>
        <div className="w-[calc(100%-140px)] overflow-hidden overflow-ellipsis text-left">
          {chromaticAddress}
        </div>
        <Button
          href={addressExplorer}
          size="base"
          css="unstyled"
          className="absolute right-2 text-primary-light"
          iconOnly={<OutlinkIcon />}
        />
      </article>
      <section className="flex mt-5 text-left">
        <article className="flex flex-col items-start w-2/5 min-w-[140px] gap-3">
          <h4 className="text-lg font-semibold">{type}</h4>
          <div className="py-2 pl-2 pr-3 border rounded-full">
            <Avatar size="xs" label={tokenName} gap="1" src={tokenImage} />
          </div>
          <div>
            <p className="flex mb-1 text-primary-lighter">Account Balance</p>
            <h5>
              <SkeletonElement isLoading={isLoading} width={80}>
                {balance} {tokenName}
              </SkeletonElement>
            </h5>
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
          <div className="tooltip-input-amount">
            <OptionInput
              value={amount}
              maxValue={maxAmount}
              onChange={onAmountChange}
              itemsAlign="stretch"
              error={isAmountError}
              errorMsg={
                isLess
                  ? `Less than minimum amount. (${minimumAmount})`
                  : isExceeded && isDeposit
                  ? 'Exceeded your wallet balance.'
                  : isExceeded && !isDeposit
                  ? 'Exceeded the available margin.'
                  : undefined
              }
              errorMsgAlign="left"
              ratios={[25, 50, 75, 100]}
            />
          </div>
          <div className="text-sm">
            <div className="mb-1 text-primary-lighter">
              To open a position in the Chromatic Protocol, you need to deposit the required amount
              of settlement assets into your account.{' '}
              <Outlink outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement" />
            </div>
          </div>
        </article>
      </section>
      <div className="mt-6 text-center">
        <Button
          label={`${type} now`}
          size="xl"
          css="active"
          className="w-full"
          // FIXME: may need to add close in the onclick event.
          onClick={() => onClickSubmit(onClose)}
          disabled={isSubmitDisabled}
        />
      </div>
    </div>
  );
};
