import '~/stories/atom/Tabs/style.css';
import './style.css';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '~/assets/icons/Icon';

import { Disclosure, Tab } from '@headlessui/react';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { Guide } from '~/stories/atom/Guide';
import { Loading } from '~/stories/atom/Loading';
import { Progress } from '~/stories/atom/Progress';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Tag } from '~/stories/atom/Tag';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';

import { usePoolProgress } from './hooks';

export function PoolProgress() {
  const {
    openButtonRef,
    ref,
    isGuideOpen,

    formattedElapsed,

    poolReceipts,
    poolReceiptsCount,
    isReceiptsEmpty,
    isClaimDisabled,
    onAllClaimClicked,

    mintingReceipts,
    mintingsCount,
    isMintingsEmpty,
    isMintingClaimDisabled,
    onAddClaimClicked,

    burningReceipts,
    burningsCount,
    isBurningsEmpty,
    isBurningClaimDisabled,
    onRemoveClaimClicked,
  } = usePoolProgress();

  return (
    <div className="PoolProgress tabs tabs-line tabs-base">
      <Disclosure>
        {({ open }) => {
          return (
            <>
              <Disclosure.Button className="relative flex items-center py-5" ref={openButtonRef}>
                <div className="ml-10 text-left">
                  <div className="flex text-lg font-bold">
                    IN PROGRESS
                    <span className="ml-[2px] mr-1">({poolReceiptsCount})</span>
                    <TooltipGuide
                      label="in-progress"
                      tip='When providing or withdrawing liquidity, it is executed based on the price of the next oracle round. You can monitor the process of each order being executed in the "In Progress" window.'
                      outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                      outLinkAbout="Next Oracle Round"
                    />
                  </div>
                  {open && (
                    <p className="mt-1 ml-auto text-sm text-primary-lighter">
                      Last oracle update: {formattedElapsed} ago
                    </p>
                  )}
                </div>
                <ChevronDownIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } w-6 text-primary-lighter absolute right-6`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="relative px-5 border-t" ref={ref}>
                <Tab.Group>
                  <div className="flex mt-5">
                    <Tab.List className="!justify-start !gap-7 px-5">
                      <Tab id="all">All</Tab>
                      <Tab id="minting">Minting ({mintingsCount})</Tab>
                      <Tab id="burning">Burning ({burningsCount})</Tab>
                    </Tab.List>
                  </div>
                  <div className="mt-5">
                    {isGuideOpen && (
                      <Guide
                        title="Next Oracle Round"
                        // The percentage value in the paragraph is a value that is different for each market.
                        paragraph="Waiting for the next oracle round. The next oracle round is updated
        whenever the Chainlink price moves by
        0.05% or more, and it is updated at least once a day."
                        outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                        outLinkAbout="Next Oracle Round"
                      />
                    )}
                  </div>
                  <Tab.Panels className="flex-auto mt-3">
                    {/* tab1 - all */}
                    <Tab.Panel className="flex flex-col gap-3 mb-5">
                      {isReceiptsEmpty ? (
                        <p className="my-6 text-center text-primary/20">
                          You have no order in progress.
                        </p>
                      ) : (
                        <>
                          <div className="absolute top-5 right-5">
                            <Button
                              label="Claim All"
                              className="ml-auto"
                              size="base"
                              css="active"
                              onClick={onAllClaimClicked}
                              disabled={isClaimDisabled}
                            />
                          </div>
                          {poolReceipts.map((props) => (
                            <ProgressItem {...props} />
                          ))}
                        </>
                      )}
                    </Tab.Panel>
                    {/* tab1 - minting */}
                    <Tab.Panel className="flex flex-col gap-3 mb-5">
                      {isMintingsEmpty ? (
                        <p className="my-6 text-center text-primary/20">
                          You have no order in progress.
                        </p>
                      ) : (
                        <>
                          <div className="absolute top-5 right-5">
                            {/* 1. when list is empty: button invisible (done) */}
                            {/* 2. when list cannot be claimed: button disabled */}
                            {/* todo: button disabled when there is nothing to claim in list */}
                            <Button
                              label="Claim All"
                              className="ml-auto"
                              size="base"
                              css="active"
                              onClick={onAddClaimClicked}
                              disabled={isMintingClaimDisabled}
                            />
                          </div>
                          {mintingReceipts.map((props) => (
                            <ProgressItem {...props} />
                          ))}
                        </>
                      )}
                    </Tab.Panel>
                    {/* tab1 - burning */}
                    <Tab.Panel className="flex flex-col gap-3 mb-5">
                      {isBurningsEmpty ? (
                        <p className="my-6 text-center text-primary/20">
                          You have no order in progress.
                        </p>
                      ) : (
                        <>
                          <div className="absolute top-5 right-5">
                            {/* 1. when list is empty: button invisible (done) */}
                            {/* 2. when list cannot be claimed: button disabled */}
                            {/* todo: button disabled when there is nothing to claim in list */}
                            <Button
                              label="Claim All"
                              className="ml-auto"
                              size="base"
                              css="active"
                              onClick={onRemoveClaimClicked}
                              disabled={isBurningClaimDisabled}
                            />
                          </div>
                          {burningReceipts.map((props) => (
                            <ProgressItem {...props} />
                          ))}
                        </>
                      )}
                    </Tab.Panel>
                    <div>
                      <TooltipGuide
                        tipOnly
                        label="minting-standby"
                        // TODO: 퍼센트값 불러오기
                        tip="Waiting for the next oracle round for liquidity provisioning (CLB minting). The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and it is updated at least once a day."
                        outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                        outLinkAbout="Next Oracle Round"
                      />
                      <TooltipGuide
                        tipOnly
                        label="minting-completed"
                        tip="The liquidity provisioning (CLB minting) process has been completed. Please transfer CLB tokens to your wallet by claiming them."
                        outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                        outLinkAbout="Next Oracle Round"
                      />
                      <TooltipGuide
                        tipOnly
                        label="burning-standby"
                        // TODO: 퍼센트값 불러오기
                        tip="Waiting for the next oracle round for liquidity withdrawing (CLB burning). The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and updated at least once a day."
                        outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                        outLinkAbout="Next Oracle Round"
                      />
                      <TooltipGuide
                        tipOnly
                        label="buring-in-progress"
                        tip="The liquidity withdrawal process is still in progress. Through consecutive oracle rounds, additional removable liquidity is retrieved. You can either stop the process and claim only the assets that have been retrieved so far, or wait until the process is completed."
                        outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                        outLinkAbout="Next Oracle Round"
                      />
                      <TooltipGuide
                        tipOnly
                        label="buring-completed"
                        tip="The liquidity withdrawal (CLB burning) process has been completed. Don't forget to transfer the assets to your wallet by claiming them."
                        outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                        outLinkAbout="Next Oracle Round"
                      />
                    </div>
                  </Tab.Panels>
                </Tab.Group>
              </Disclosure.Panel>
            </>
          );
        }}
      </Disclosure>
    </div>
  );
}

interface ProgressItemProps {
  key: string;
  detail: string;
  name: string;
  image?: string;
  remainedCLBAmount?: string;
  tokenName: string;
  progressPercent: number;
  onClick: () => unknown;
  isLoading: boolean;
  isStandby: boolean;
  isInprogress: boolean;
  isCompleted: boolean;
  isAdd: boolean;
  isRemove: boolean;
}

const ProgressItem = (props: ProgressItemProps) => {
  const {
    detail,
    name,
    image,
    remainedCLBAmount,
    tokenName,
    progressPercent,
    onClick,
    isLoading,
    isStandby,
    isInprogress,
    isCompleted,
    isAdd,
    isRemove,
  } = props;

  const renderTitle = isAdd ? 'minting' : isRemove ? 'burning' : '';

  const renderTip =
    isAdd && isStandby
      ? `Waiting for the next oracle round for liquidity provisioning (CLB minting). The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and it is updated at least once a day.`
      : isAdd && isCompleted
      ? 'The liquidity provisioning (CLB minting) process has been completed. Please transfer CLB tokens to your wallet by claiming them.'
      : isRemove && isStandby
      ? `Waiting for the next oracle round for liquidity withdrawing (CLB burning). The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and updated at least once a day.`
      : isRemove && isInprogress
      ? 'The liquidity withdrawal process is still in progress. Through consecutive oracle rounds, additional removable liquidity is retrieved. You can either stop the process and claim only the assets that have been retrieved so far, or wait until the process is completed.'
      : isRemove && isCompleted
      ? "The liquidity withdrawal (CLB burning) process has been completed. Don't forget to transfer the assets to your wallet by claiming them."
      : '';

  return (
    <div className="flex flex-col gap-3 px-5 py-4 border dark:border-transparent dark:bg-paper-light rounded-xl">
      <div className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 capitalize">
          {renderTitle}
          <span className="flex mr-1">
            {isStandby && (
              <Tag label="standby" className="text-status-standby bg-status-standby-light/10" />
            )}
            {isInprogress && (
              <Tag
                label="in progress"
                className="text-status-inprogress bg-status-inprogress-light/10"
              />
            )}
            {isCompleted && (
              <Tag
                label="completed"
                className="text-status-completed bg-status-completed-light/10"
              />
            )}
            <TooltipGuide
              label="status-info"
              outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
              outLinkAbout="Next Oracle Round"
              tip={renderTip}
            />
          </span>
        </h4>
        <div className="flex items-center gap-[6px] text-sm tracking-tight text-primary text-right">
          <span className="">
            {isCompleted ? <CheckIcon className="w-4" /> : <Loading size="sm" />}
          </span>
          <p className="">
            {detail} {isCompleted && isAdd && 'CLB'}
          </p>
        </div>
      </div>
      {isRemove ? (
        <Progress css="simple" value={progressPercent} max={100} />
      ) : (
        <div className="border-t" />
      )}
      <div className="flex justify-between gap-3 mt-1">
        <div
          className={`flex items-center gap-3 ${
            (isAdd && isStandby) || (isRemove && isCompleted) ? 'opacity-30' : ''
          }`}
        >
          <SkeletonElement isLoading={isLoading} width={40} height={40}>
            <Thumbnail className="rounded" src={image} />
          </SkeletonElement>
          <div>
            <div className="flex items-center gap-1">
              <SkeletonElement isLoading={isLoading} circle width={16} height={16} />
              <SkeletonElement isLoading={isLoading} width={40}>
                <Avatar label={tokenName} size="xs" gap="1" />
              </SkeletonElement>
            </div>
            <p className="mt-1 text-left text-primary-lighter">
              <SkeletonElement isLoading={isLoading} width={60}>
                {name}
              </SkeletonElement>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end justify-end">
          {isRemove && !isStandby && (
            <p className="mb-2 -mt-2 text-primary-light">{remainedCLBAmount} CLB Remaining</p>
          )}
          <Button
            label={
              isRemove
                ? isInprogress
                  ? `Stop Process & Claim ${tokenName}`
                  : `Claim ${tokenName}`
                : 'Claim CLB'
            }
            css="active"
            size="sm"
            className={`self-end ${isStandby ? ' !textL2' : ''}`}
            onClick={onClick}
            disabled={isStandby}
          />
        </div>
      </div>
    </div>
  );
};
