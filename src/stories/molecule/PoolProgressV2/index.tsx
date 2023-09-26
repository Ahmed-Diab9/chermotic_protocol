import '~/stories/atom/Tabs/style.css';
import './style.css';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import CheckIcon from '~/assets/icons/CheckIcon';

import { Disclosure, Tab } from '@headlessui/react';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { Guide } from '~/stories/atom/Guide';
import { Loading } from '~/stories/atom/Loading';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';

import { usePoolProgressV2 } from './hooks';

export function PoolProgressV2() {
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
  } = usePoolProgressV2();

  return (
    <div className="PoolProgressV2 tabs tabs-line tabs-base">
      <Disclosure>
        {({ open }) => {
          return (
            <>
              <Disclosure.Button className="relative flex items-start py-5" ref={openButtonRef}>
                <div className="px-5 text-left">
                  <div className="flex text-xl font-bold">
                    In Progress
                    <span className="mx-1">({poolReceiptsCount})</span>
                    <TooltipGuide
                      label="in-progress"
                      tip='When providing or withdrawing liquidity, it is executed based on the price of the next oracle round. You can monitor the process of each order being executed in the "In Progress" window.'
                      outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                      outLinkAbout="Next Oracle Round"
                    />
                  </div>
                  <p className="mt-2 ml-auto text-primary-light">
                    Last oracle update: {formattedElapsed} ago
                  </p>
                </div>
                <ChevronDownIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } w-4 text-primary absolute right-3`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="relative px-5 -mx-5" ref={ref}>
                <Tab.Group>
                  <div className="flex px-5 mt-2 border-b">
                    <Tab.List className="!justify-start !gap-7">
                      <Tab id="all">All</Tab>
                      <Tab id="minting">Minting ({mintingsCount})</Tab>
                      <Tab id="burning">Burning ({burningsCount})</Tab>
                    </Tab.List>
                  </div>
                  <Tab.Panels className="flex-auto">
                    <div className="mb-1">
                      {isGuideOpen && (
                        <Guide
                          title="You can leave now"
                          // paragraph 내 퍼센트 값은 마켓마다 다르게 불러오는 값입니다.
                          paragraph="The liquidity provision process is now waiting for next oracle round. The CLP tokens will be sent to your wallet when the process completed."
                          outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                          outLinkAbout="Next Oracle Round"
                          className="!rounded-none"
                        />
                      )}
                    </div>
                    {/* tab - all */}
                    <Tab.Panel className="flex flex-col mb-5">
                      {isReceiptsEmpty ? (
                        <p className="my-6 text-center text-primary/20">
                          You have no order in progress.
                        </p>
                      ) : (
                        <>
                          {poolReceipts.map((props) => (
                            <ProgressItem {...props} />
                          ))}
                          {/* More button(including wrapper): should be shown when there are more than 2 lists  */}
                          {/* default: show up to 2 lists */}
                          <div className="flex justify-center mt-5">
                            <Button label="More" css="underlined" size="sm" />
                          </div>
                        </>
                      )}
                    </Tab.Panel>
                    {/* tab - minting */}
                    <Tab.Panel className="flex flex-col mb-5">
                      {isMintingsEmpty ? (
                        <p className="my-6 text-center text-primary/20">
                          You have no order in progress.
                        </p>
                      ) : (
                        <>
                          {mintingReceipts.map((props) => (
                            <ProgressItem {...props} />
                          ))}
                          {/* More button(including wrapper): should be shown when there are more than 2 lists  */}
                          {/* default: show up to 2 lists */}
                          {/* <div className="flex justify-center mt-5">
                            <Button label="More" css="underlined" size="sm" />
                          </div> */}
                        </>
                      )}
                    </Tab.Panel>
                    {/* tab - burning */}
                    <Tab.Panel className="flex flex-col mb-5">
                      {isBurningsEmpty ? (
                        <p className="my-6 text-center text-primary/20">
                          You have no order in progress.
                        </p>
                      ) : (
                        <>
                          {burningReceipts.map((props) => (
                            <ProgressItem {...props} />
                          ))}
                          {/* More button(including wrapper): should be shown when there are more than 2 lists  */}
                          {/* default: show up to 2 lists */}
                          {/* <div className="flex justify-center mt-5">
                            <Button label="More" css="underlined" size="sm" />
                          </div> */}
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

  return (
    <div className="flex items-center gap-5 px-5 py-3 border-b">
      <h4 className="flex capitalize text-primary-light min-w-[128px] pr-5 border-r text-left">
        {renderTitle}
        <br />
        CLP Tokens
      </h4>
      <div className="">
        {/* Avatar label unit: */}
        {/* minting: CLP / burning: settle token */}
        <Avatar label="101.383 CLP" size="sm" fontSize="lg" gap="1" />
        {/* todo: show only if some parts cannot be withdrawn */}
        {/* <p className="text-sm mt-[2px]">205.25 CLP Returned</p> */}
      </div>
      <div className="ml-auto text-right">
        {isCompleted && <p className="text-sm text-primary-light mb-[2px]">May 20 17:45:12</p>}
        <div className="flex items-center gap-[6px] text-sm tracking-tight text-primary">
          <span className="">
            {isCompleted ? <CheckIcon className="w-4" /> : <Loading size="sm" />}
          </span>
          {isCompleted && isAdd ? 'Completed' : detail}
          {/* todo: if some parts cannot be withdrawn */}
          {/* 00% withdrawn <TooltipGuide label="withdraw-returned" tip="" /> */}
        </div>
      </div>
    </div>
  );
};
