import '~/stories/atom/Tabs/style.css';
import './style.css';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '~/assets/icons/Icon';

import { Disclosure, Tab } from '@headlessui/react';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { Guide } from '~/stories/atom/Guide';
import { Loading } from '~/stories/atom/Loading';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';

import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { LpReceipt } from '~/typings/lp';
import { formatTimestamp } from '~/utils/date';
import { usePoolProgressV2 } from './hooks';

export function PoolProgressV2() {
  const {
    openButtonRef,
    ref,
    formattedElapsed,
    receipts = [],
    isGuideOpens,
    counts,
    receiptAction,
    hasMoreReceipts,
    onActionChange,
    onGuideClose,
    onFetchNextLpReceipts,
  } = usePoolProgressV2();

  return (
    <div className="PoolProgressV2">
      <Disclosure>
        {({ open }) => {
          return (
            <>
              <Disclosure.Button
                className="relative flex items-start py-5 px-7"
                ref={openButtonRef}
              >
                <div className="text-left">
                  <div className="flex text-xl font-bold">
                    In Progress
                    <span className="mx-1">({counts['inProgress']})</span>
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
                  className={`${open ? 'rotate-180 transform' : ''} w-4 text-primary ml-auto`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="relative px-7 -mx-7" ref={ref}>
                <div className="wrapper-tabs">
                  <Tab.Group
                    onChange={(index) => {
                      onActionChange(index);
                    }}
                  >
                    <div className="flex mt-2 border-b px-7">
                      <Tab.List className="!justify-start !gap-7 tabs-list tabs-line tabs-base">
                        <Tab id="all">All</Tab>
                        <Tab id="minting">Minting ({counts['minting']})</Tab>
                        <Tab id="burning">Burning ({counts['burning']})</Tab>
                      </Tab.List>
                    </div>
                    <Tab.Panels className="flex-auto">
                      <div className="mb-1">
                        <Guide
                          isVisible={isGuideOpens[receiptAction]}
                          title="The CLP minting or burning process is in progress. You may leave now."
                          // The percentage value in the paragraph is a value that is different for each market.
                          paragraph="The liquidity provision or withdrawal process is now waiting for next oracle
                        round. The assets will be sent to your wallet when the process completed."
                          outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                          outLinkAbout="Next Oracle Round"
                          className="!rounded-none"
                          padding="lg"
                          onClick={onGuideClose}
                        />
                      </div>
                      {/* tab - all */}
                      <Tab.Panel className="flex flex-col mb-5">
                        {receipts.length === 0 ? (
                          <p className="my-6 text-center text-primary/20">
                            There is no liquidity add or remove history.
                          </p>
                        ) : (
                          <>
                            {receipts.map((receipt) => (
                              <ProgressItem {...receipt} key={receipt.key} />
                            ))}
                            {/* More button(including wrapper): should be shown when there are more than 2 lists  */}
                            {/* default: show up to 2 lists */}
                            {hasMoreReceipts && (
                              <div className="flex justify-center mt-5">
                                <Button
                                  label="More"
                                  css="underlined"
                                  size="sm"
                                  onClick={() => {
                                    onFetchNextLpReceipts();
                                  }}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </Tab.Panel>
                      {/* tab - minting */}
                      <Tab.Panel className="flex flex-col mb-5">
                        {counts['minting'] === 0 ? (
                          <p className="my-6 text-center text-primary/20">
                            There is no liquidity add history.
                          </p>
                        ) : (
                          <></>
                        )}
                        {
                          <>
                            {receipts.map((receipt) => (
                              <ProgressItem {...receipt} key={receipt.key} />
                            ))}
                            {/* More button(including wrapper): should be shown when there are more than 2 lists  */}
                            {/* default: show up to 2 lists */}
                            {hasMoreReceipts && (
                              <div
                                className="flex justify-center mt-5"
                                onClick={() => {
                                  onFetchNextLpReceipts();
                                }}
                              >
                                <Button label="More" css="underlined" size="sm" />
                              </div>
                            )}
                          </>
                        }
                      </Tab.Panel>
                      {/* tab - burning */}
                      <Tab.Panel className="flex flex-col mb-5">
                        {counts['burning'] === 0 ? (
                          <p className="my-6 text-center text-primary/20">
                            There is no liquidity remove history.
                          </p>
                        ) : (
                          <></>
                        )}
                        {
                          <>
                            {receipts.map((receipt) => (
                              <ProgressItem {...receipt} key={receipt.key} />
                            ))}
                            {/* More button(including wrapper): should be shown when there are more than 2 lists  */}
                            {/* default: show up to 2 lists */}
                            {hasMoreReceipts && (
                              <div
                                className="flex justify-center mt-5"
                                onClick={() => {
                                  onFetchNextLpReceipts();
                                }}
                              >
                                <Button label="More" css="underlined" size="sm" />
                              </div>
                            )}
                          </>
                        }
                      </Tab.Panel>
                      <div>
                        <TooltipGuide
                          tipOnly
                          label="minting-standby"
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
                </div>
              </Disclosure.Panel>
            </>
          );
        }}
      </Disclosure>
    </div>
  );
}

interface ProgressItemProps extends LpReceipt {
  key: string;
  onClick?: () => unknown;
}

const ProgressItem = (props: ProgressItemProps) => {
  const { onClick, token, hasReturnedValue, ...receipt } = props;

  return (
    <div className="flex items-center gap-5 py-3 border-b px-7" onClick={onClick}>
      <h4 className="flex capitalize text-primary-light min-w-[128px] pr-5 border-r text-left">
        {receipt.action}
        <br />
        CLP Tokens
      </h4>
      <div className="">
        {/* Avatar label unit: */}
        {/* minting: CLP / burning: settle token */}
        <SkeletonElement isLoading={receipt.status === 'standby' || !receipt.isSettled} width={120}>
          <Avatar label={receipt.detail[0]} size="sm" fontSize="lg" gap="1" src={token.logo} />
          {hasReturnedValue && receipt.detail[1] && (
            <p className="text-sm mt-[2px]">{receipt.detail[1]} CLP Returned</p>
          )}
        </SkeletonElement>
      </div>
      <div className="ml-auto text-right">
        {receipt.status === 'completed' && (
          <p className="text-sm text-primary-light mb-[2px]">
            {formatTimestamp(receipt.blockTimestamp)}
          </p>
        )}
        <div className="flex items-center gap-[6px] text-sm tracking-tight text-primary">
          <span className="">
            {receipt.status === 'completed' ? <CheckIcon className="w-4" /> : <Loading size="sm" />}
          </span>
          <p>{receipt.message}</p>
          {hasReturnedValue && <TooltipGuide label="withdraw-returned" tip="" />}
          {receipt.status === 'standby' && receipt.action === 'minting' && (
            <TooltipGuide
              label="minting-standby-clp"
              tip="Waiting for the next oracle round for liquidity provisioning (CLP minting). The next oracle round mechanism is updated whenever the Chainlink price moves by (0.05%) or more, and it is updated at least once a day."
            />
          )}
          {receipt.status === 'standby' && receipt.action === 'burning' && (
            <TooltipGuide
              label="burning-standby-clp"
              tip="Waiting for the next oracle round for liquidity withdrawing (CLP burning). The next oracle round mechanism is updated whenever the Chainlink price moves by (0.05%) or more, and updated at least once a day."
            />
          )}
          {/* todo: if some parts cannot be withdrawn */}
          {/* 00% withdrawn <TooltipGuide label="withdraw-returned" tip="" /> */}
        </div>
      </div>
    </div>
  );
};
