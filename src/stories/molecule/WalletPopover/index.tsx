import '~/stories/atom/Tabs/style.css';
import './style.css';

import { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import arbitrumIcon from '~/assets/images/arbitrum.svg';

import { Popover, Tab, Transition } from '@headlessui/react';
import { ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { AddressCopyButton } from '~/stories/atom/AddressCopyButton';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';

import { OutlinkIcon } from '~/assets/icons/Icon';
import { TooltipAlert } from '~/stories/atom/TooltipAlert';
import { useWalletPopover } from './hooks';

interface WalletPopoverProps {
  isDisconnected?: boolean;
  isWrongChain?: boolean;
}

export function WalletPopover({ isDisconnected, isWrongChain }: WalletPopoverProps) {
  const {
    onConnect,
    onSwitchChain,
    onCreateAccount,
    onDisconnect,

    isLoading,

    chainName,

    accountExplorerUrl,

    assets,
    isAssetEmpty,

    liquidityTokens,
    isLiquidityTokenEmpty,

    walletAddress,
    onCopyWalletAddress,

    chromaticAddress,
    onCopyChromaticAddress,
    isChromaticAccountExist,
  } = useWalletPopover();

  if (isDisconnected) {
    return (
      <button
        onClick={onConnect}
        title="connect"
        className={`btn btn-wallet min-w-[148px] !bg-primary`}
      >
        <Avatar src={arbitrumIcon} className="avatar" size="lg" />
        <p className="w-full pr-4 text-lg font-semibold text-center text-inverted">Connect</p>
      </button>
    );
  } else if (isWrongChain) {
    return (
      <button
        onClick={onSwitchChain}
        title="change network"
        className={`tooltip-change-network min-w-[175px] btn-wallet`}
      >
        <Avatar
          svg={<ExclamationTriangleIcon />}
          className="text-primary avatar !bg-paper"
          fontSize="sm"
          fontWeight="normal"
          gap="3"
          label={walletAddress}
          size="lg"
        />
        <TooltipAlert
          label="change-network"
          tip="Change Network"
          place="bottom"
          css="outline"
          className=""
        />
      </button>
    );
  }

  return (
    <div className={`WalletPopover popover text-right`}>
      <Popover>
        {({ close }) => (
          <>
            <Popover.Button className="btn btn-wallet min-w-[175px]">
              <Avatar
                label={walletAddress}
                src={arbitrumIcon}
                className="!w-[36px] !h-[36px]"
                size="lg"
                fontSize="sm"
                fontWeight="normal"
                gap="3"
              />
            </Popover.Button>
            <Popover.Overlay className="backdrop" />
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-50 translate-x-20"
              enterTo="opacity-100 translate-x-0"
              leave="transition ease-in duration-0"
              // leaveFrom="opacity-100 translate-x-20"
              // leaveTo="opacity-100 translate-x-0"
            >
              <Popover.Panel className="transform border-l shadow-xl popover-panel">
                <div className="relative flex flex-col h-full ">
                  <Avatar src={arbitrumIcon} label={chainName} size="xl" fontSize="sm" gap="3" />
                  <section className="flex flex-col flex-grow mt-6 box-inner">
                    <article className="px-4 py-3 border-b bg-paper-light dark:bg-paper">
                      <h4 className="mb-3 text-base text-center text-primary-lighter">
                        Connected Wallet
                      </h4>
                      <div className="flex items-center justify-between gap-2">
                        <AddressCopyButton address={walletAddress} onClick={onCopyWalletAddress} />
                        <Button
                          href={accountExplorerUrl}
                          label="view transition"
                          css="light"
                          size="lg"
                          iconOnly={<OutlinkIcon />}
                        />
                      </div>
                    </article>
                    <div className="relative flex flex-col flex-auto w-full py-4 overflow-hidden tabs tabs-line dark:bg-inverted-lighter">
                      <Tab.Group>
                        <Tab.List className="absolute left-0 w-full top-4">
                          <Tab className="w-[80px]">Assets</Tab>
                          <Tab>Liquidity Token</Tab>
                        </Tab.List>
                        <Tab.Panels className="mt-[60px] pb-[60px] absolute bottom-0 px-4 overflow-auto h-[calc(100%-72px)] w-full">
                          <Tab.Panel>
                            <article>
                              {isAssetEmpty ? (
                                <p className="text-center text-primary/20">You have no asset.</p>
                              ) : (
                                <div className="flex flex-col gap-3">
                                  {assets.map(
                                    ({ key, name, image, usdPrice, balance, explorerUrl }) => (
                                      <div key={key} className="flex items-center">
                                        <div className="flex items-center gap-1">
                                          <SkeletonElement
                                            isLoading={isLoading}
                                            circle
                                            width={24}
                                            height={24}
                                          />
                                          <SkeletonElement isLoading={isLoading} width={40}>
                                            <Avatar
                                              label={name}
                                              src={image}
                                              size="base"
                                              fontSize="base"
                                              gap="2"
                                            />
                                          </SkeletonElement>
                                          <Button
                                            href={explorerUrl}
                                            iconOnly={<OutlinkIcon />}
                                            css="unstyled"
                                            size="sm"
                                            className="text-primary-light"
                                          />
                                        </div>

                                        <div className="ml-auto text-right">
                                          <p className="text-sm text-primary-lighter">
                                            <SkeletonElement isLoading={isLoading} width={40}>
                                              ${usdPrice}
                                            </SkeletonElement>
                                          </p>
                                          <p className="mt-1 text-base font-medium text-primary">
                                            <SkeletonElement isLoading={isLoading} width={40}>
                                              {balance} {name}
                                            </SkeletonElement>
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </article>
                          </Tab.Panel>
                          <Tab.Panel>
                            <article>
                              {isLiquidityTokenEmpty ? (
                                <p className="text-center text-primary/20">
                                  You have no liquidity token.
                                </p>
                              ) : (
                                <div className="flex flex-col gap-3">
                                  {liquidityTokens.map(
                                    ({ key, name, market, image, liquidity, bins }) => (
                                      <Link to="#" key={key}>
                                        <div className="flex gap-3 pb-3 border-b last:border-b-0">
                                          <SkeletonElement
                                            isLoading={isLoading}
                                            circle
                                            width={40}
                                            height={40}
                                          >
                                            <Avatar size="xl" src={image} />
                                          </SkeletonElement>
                                          <div className="flex-1">
                                            <div className="flex gap-2 leading-none">
                                              <SkeletonElement isLoading={isLoading} width={100}>
                                                <p>{name}</p>
                                                <span className="px-1 text-gray-lighter">|</span>
                                                <p>{market}</p>
                                              </SkeletonElement>
                                            </div>
                                            <div className="flex mt-3">
                                              <div className="mr-auto">
                                                <p className="text-base font-medium text-primary-lighter">
                                                  <SkeletonElement isLoading={isLoading} width={80}>
                                                    {liquidity} {name}
                                                  </SkeletonElement>
                                                </p>
                                                <p className="mt-2 text-base text-primary">
                                                  <SkeletonElement isLoading={isLoading} width={80}>
                                                    {bins} Bins
                                                  </SkeletonElement>
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </Link>
                                    )
                                  )}
                                </div>
                              )}
                            </article>
                          </Tab.Panel>
                        </Tab.Panels>
                      </Tab.Group>
                    </div>
                  </section>
                  <section className="mt-10 mb-5 box-inner">
                    <article className="px-4 py-3 bg-paper-light dark:bg-paper">
                      {isChromaticAccountExist ? (
                        <>
                          <h4 className="mb-3 text-base text-center text-primary-lighter">
                            My Account
                          </h4>
                          <div className="flex items-center justify-between gap-2">
                            <AddressCopyButton
                              address={chromaticAddress}
                              onClick={onCopyChromaticAddress}
                            />
                            <Button
                              href={accountExplorerUrl}
                              label="view transition"
                              css="light"
                              size="lg"
                              iconOnly={<OutlinkIcon />}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <h4 className="mb-3 text-base text-center text-primary-lighter">
                            You need to create account first.
                          </h4>
                          <div className="text-center">
                            <Button
                              label="Create Account"
                              size="base"
                              css="default"
                              onClick={onCreateAccount}
                            />
                          </div>
                        </>
                      )}
                    </article>
                  </section>
                  <Button
                    label="Disconnect"
                    onClick={() => {
                      onDisconnect();
                      close();
                    }}
                    size="xl"
                    css="active"
                    className="w-full mb-3 border-none"
                  />
                  <Button
                    label="close popover"
                    iconOnly={<ChevronDoubleRightIcon />}
                    onClick={close}
                    size="lg"
                    css="unstyled"
                    className="absolute left-0 t-10 ml-[-60px]"
                  />
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}
