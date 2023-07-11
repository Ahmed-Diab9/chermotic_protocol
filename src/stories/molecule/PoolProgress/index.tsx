import { Thumbnail } from '~/stories/atom/Thumbnail';
import { Avatar } from '~/stories/atom/Avatar';
import { Tag } from '~/stories/atom/Tag';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { Button } from '~/stories/atom/Button';
import { Progress } from '~/stories/atom/Progress';
import { Loading } from '~/stories/atom/Loading';
import { Tab } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Guide } from '~/stories/atom/Guide';
import { Disclosure } from '@headlessui/react';
import '../../atom/Tabs/style.css';
import Skeleton from 'react-loading-skeleton';

import { BigNumber } from 'ethers';
// import { LPReceipt } from "~/typings/receipt";
import { Market, Token } from '~/typings/market';
import { isValid } from '~/utils/valid';
import { usePrevious } from '~/hooks/usePrevious';
import { LpReceipt, LpReceiptAction } from '../../../hooks/usePoolReceipt';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { formatDecimals } from '~/utils/number';
import { POOL_EVENT } from '~/typings/events';

interface PoolProgressProps {
  token?: Token;
  market?: Market;
  receipts?: LpReceipt[];
  isLoading?: boolean;
  onReceiptClaim?: (id: BigNumber, action: LpReceiptAction) => unknown;
  onReceiptClaimBatch?: () => unknown;
}

export const PoolProgress = ({
  token,
  market,
  receipts = [],
  isLoading,
  onReceiptClaim,
  onReceiptClaimBatch,
}: PoolProgressProps) => {
  const previousReceipts = usePrevious(receipts, true);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isClaimEnabled =
    receipts.filter((receipt) => receipt.status === 'completed').map((receipt) => receipt.id)
      .length !== 0;
  const { mintings, burnings } = useMemo(() => {
    let mintings = 0;
    let burnings = 0;
    (receipts ?? previousReceipts).forEach((receipt) => {
      if (receipt.action === 'add') {
        mintings++;
      } else {
        burnings++;
      }
    });
    return { mintings, burnings };
  }, [receipts]);
  useEffect(() => {
    function onPool() {
      if (isValid(openButtonRef.current) && !isOpen) {
        openButtonRef.current.click();
      } else {
        console.error('ERROR in opening progresses');
      }
    }
    window.addEventListener(POOL_EVENT, onPool);
    return () => {
      window.removeEventListener(POOL_EVENT, onPool);
    };
  }, [isOpen]);

  return (
    <div className="!flex flex-col border PoolProgress shadow-lg tabs tabs-line tabs-base rounded-2xl bg-white">
      <Disclosure>
        {({ open }) => {
          setIsOpen(open);
          return (
            <>
              <Disclosure.Button className="relative flex items-center py-5" ref={openButtonRef}>
                <div className="ml-10 text-left">
                  <h4 className="flex font-bold">
                    IN PROGRESS
                    <span className="ml-[2px] mr-1">({receipts.length})</span>
                    <TooltipGuide
                      label="in-progress"
                      tip='When providing or withdrawing liquidity, it is executed based on the price of the next oracle round. You can monitor the process of each order being executed in the "In Progress" window.'
                    />
                  </h4>
                  {open && (
                    <p className="mt-1 ml-auto text-sm text-black/30">
                      Last oracle update: 00h 00m 00s ago
                    </p>
                  )}
                </div>
                <ChevronDownIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } w-6 text-black/30 absolute right-6`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-5 text-gray-500 border-t">
                <Tab.Group>
                  <div className="flex mt-5">
                    <Tab.List className="!justify-start !gap-7 px-5">
                      <Tab>All</Tab>
                      <Tab>Minting ({mintings})</Tab>
                      <Tab>Burning ({burnings})</Tab>
                    </Tab.List>
                    <Button
                      label="Claim All"
                      className="ml-auto"
                      size="base"
                      css="gray"
                      onClick={() => onReceiptClaimBatch?.()}
                    />
                  </div>

                  <div className="mt-4">
                    {/* <Button
                    label="Claim All"
                    className="w-full border-gray"
                    size="xl"
                    onClick={() => onReceiptClaimBatch?.()}
                  /> */}
                  </div>
                  <div className="mt-5">
                    <Guide
                      title="Next Oracle Round"
                      // paragraph 내 퍼센트 값은 마켓마다 다르게 불러오는 값입니다.
                      paragraph="Waiting for the next oracle round. The next oracle round is updated
        whenever the Chainlink price moves by
        0.00% or more, and it is updated at least once a day."
                      outLink="/pool"
                      outLinkAbout="Next Oracle Round"
                    />
                  </div>
                  <Tab.Panels className="flex-auto mt-3">
                    {/* tab1 - all */}
                    <Tab.Panel className="flex flex-col gap-3 mb-5">
                      {isValid(market) &&
                        (receipts || previousReceipts).map((receipt, index) => (
                          <ProgressItem
                            key={`all-${receipt.id.toString()}-${index}`}
                            // title={receipt.title}
                            status={receipt.status}
                            detail={
                              receipt.status === 'standby'
                                ? 'Waiting for the next oracle round'
                                : formatDecimals(receipt.amount, token?.decimals, 2)
                            }
                            name={receipt.name}
                            progressPercent={0}
                            action={receipt.action}
                            onClick={() => {
                              onReceiptClaim?.(receipt.id, receipt.action);
                            }}
                            isLoading={isLoading}
                          />
                        ))}
                    </Tab.Panel>
                    {/* tab1 - minting */}
                    <Tab.Panel className="flex flex-col gap-3 mb-5">
                      {isValid(market) &&
                        (receipts || previousReceipts)
                          .filter((receipt) => receipt.action === 'add')
                          .map((receipt, index) => (
                            <ProgressItem
                              key={`minting-${receipt.id.toString()}-${index}`}
                              // title={receipt.title}
                              status={receipt.status}
                              detail={
                                receipt.status === 'standby'
                                  ? 'Waiting for the next oracle round'
                                  : formatDecimals(receipt.amount, token?.decimals, 2)
                              }
                              name={receipt.name}
                              progressPercent={0}
                              action={receipt.action}
                              onClick={() => {
                                onReceiptClaim?.(receipt.id, receipt.action);
                              }}
                              isLoading={isLoading}
                            />
                          ))}
                    </Tab.Panel>
                    {/* tab1 - burning */}
                    <Tab.Panel className="flex flex-col gap-3 mb-5">
                      {isValid(market) &&
                        (receipts || previousReceipts)
                          .filter((receipt) => receipt.action === 'remove')
                          .map((receipt, index) => (
                            <ProgressItem
                              key={`burning-${receipt.id.toString()}-${index}`}
                              // title={receipt.title}
                              status={receipt.status}
                              detail={
                                receipt.status === 'standby'
                                  ? 'Waiting for the next oracle round'
                                  : formatDecimals(receipt.amount, token?.decimals, 2)
                              }
                              name={receipt.name}
                              progressPercent={0}
                              action={receipt.action}
                              onClick={() => {
                                onReceiptClaim?.(receipt.id, receipt.action);
                              }}
                              isLoading={isLoading}
                            />
                          ))}
                    </Tab.Panel>
                    <div>
                      <TooltipGuide
                        tipOnly
                        label="minting-standby"
                        // todo: 퍼센트값 불러오기
                        tip="Waiting for the next oracle round for liquidity provisioning (CLB minting). The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and it is updated at least once a day."
                        outLink="#"
                        outLinkAbout="Next Oracle Round"
                      />
                      <TooltipGuide
                        tipOnly
                        label="minting-completed"
                        tip="The liquidity provisioning (CLB minting) process has been completed. Please transfer CLB tokens to your wallet by claiming them."
                        outLink="#"
                        outLinkAbout="Next Oracle Round"
                      />
                      <TooltipGuide
                        tipOnly
                        label="burning-standby"
                        // todo: 퍼센트값 불러오기
                        tip="Waiting for the next oracle round for liquidity withdrawing (CLB burning). The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and updated at least once a day."
                        outLink="#"
                        outLinkAbout="Next Oracle Round"
                      />
                      <TooltipGuide
                        tipOnly
                        label="buring-in-progress"
                        tip="The liquidity withdrawal process is still in progress. Through consecutive oracle rounds, additional removable liquidity is retrieved. You can either stop the process and claim only the assets that have been retrieved so far, or wait until the process is completed."
                        outLink="#"
                        outLinkAbout="Next Oracle Round"
                      />
                      <TooltipGuide
                        tipOnly
                        label="buring-completed"
                        tip="The liquidity withdrawal (CLB burning) process has been completed. Don't forget to transfer the assets to your wallet by claiming them."
                        outLink="#"
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
};

interface ProgressItemProps {
  title?: string;
  status: LpReceipt['status'];
  detail?: string;
  token?: string;
  name: string;
  image?: string;
  progressPercent?: number;
  action: LpReceipt['action'];
  isLoading?: boolean;
  onClick?: () => unknown;
}

const ProgressItem = (props: ProgressItemProps) => {
  const {
    title,
    status,
    detail,
    token = 'USDC',
    name,
    image,
    action,
    progressPercent,
    isLoading,
    onClick,
  } = props;

  const renderTitle = useMemo(() => {
    return action === 'add' ? 'minting' : action === 'remove' ? 'burning' : '';
  }, [action]);

  return (
    <div className="flex flex-col gap-3 px-5 py-4 border rounded-xl">
      <div className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 capitalize">
          {renderTitle}
          <span className="flex mr-1">
            {status === 'standby' ? (
              // <Tag label="standby" className="text-[#FF9820] bg-[#FF8900]/10" />
              <Tag label="standby" className="text-black/30 bg-gray/20" />
            ) : status === 'completed' ? (
              // <Tag
              //   label="completed"
              //   className="text-[#03C239] bg-[#23F85F]/10"
              // />
              <Tag label="completed" className="text-white bg-grayD" />
            ) : (
              // <Tag
              //   label="in progress"
              //   className="text-[#13D2C7] bg-[#1EFCEF]/10"
              // />
              <Tag label="in progress" className="text-grayD bg-gray/20" />
            )}
            <TooltipGuide
              outLink="#"
              outLinkAbout="Next Oracle Round"
              tip={
                // todo: 퍼센트값 불러오기 (백틱 표시)
                action === 'add' && status === 'standby'
                  ? `Waiting for the next oracle round for liquidity provisioning (CLB minting). The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and it is updated at least once a day.`
                  : action === 'add' && status === 'completed'
                  ? 'The liquidity provisioning (CLB minting) process has been completed. Please transfer CLB tokens to your wallet by claiming them.'
                  : action === 'remove' && status === 'standby'
                  ? `Waiting for the next oracle round for liquidity withdrawing (CLB burning). The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and updated at least once a day.`
                  : action === 'remove' && status === 'in progress'
                  ? 'The liquidity withdrawal process is still in progress. Through consecutive oracle rounds, additional removable liquidity is retrieved. You can either stop the process and claim only the assets that have been retrieved so far, or wait until the process is completed.'
                  : action === 'remove' && status === 'completed'
                  ? "The liquidity withdrawal (CLB burning) process has been completed. Don't forget to transfer the assets to your wallet by claiming them."
                  : ''
              }
            />
          </span>
        </h4>
        <div className="flex items-center gap-[6px] text-sm tracking-tight text-black text-right">
          <span className="">
            {status === 'completed' ? <CheckIcon className="w-4" /> : <Loading size="xs" />}
          </span>
          <p className="">
            {detail} {token}
          </p>
        </div>
      </div>
      {action === 'add' ? (
        <Progress value={progressPercent} max={100} />
      ) : (
        <div className="border-t" />
      )}
      <div className="flex items-end gap-3 mt-1">
        <div
          className={`flex items-end gap-3 ${
            ((action === 'add' && status === 'standby') ||
              (action === 'remove' && status === 'completed')) &&
            'opacity-30'
          }`}
        >
          {isLoading ? (
            <Skeleton width={40} containerClassName="text-[40px]" />
          ) : (
            <Thumbnail className="rounded" src={image} />
          )}
          <div>
            {isLoading ? (
              <div className="flex items-center gap-1">
                <Skeleton circle containerClassName="avatar-skeleton w-4 text-lg" />
                <Skeleton width={40} />
              </div>
            ) : (
              <Avatar label={token} size="xs" gap="1" />
            )}
            <p className="mt-1 text-left text-black/30">
              {isLoading ? <Skeleton width={60} /> : <>{name}</>}
            </p>
          </div>
        </div>
        {status === 'standby' ? (
          <Button
            label={action === 'add' ? `Claim ${token}` : 'Claim Tokens'}
            size="sm"
            className="ml-auto !text-gray"
            disabled
          />
        ) : (
          <Button
            label={
              action === 'remove'
                ? status === 'in progress'
                  ? `Stop Process & Claim ${token}`
                  : `Claim ${token}`
                : 'Claim Tokens'
            }
            css="active"
            size="sm"
            className="ml-auto"
            onClick={onClick}
          />
        )}
      </div>
    </div>
  );
};
