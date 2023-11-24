import { Tab } from '@headlessui/react';
import { ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { OutlinkIcon, PlusIcon } from '~/assets/icons/Icon';
import arbitrumIcon from '~/assets/images/arbitrum.svg';
import { AddressWithButton } from '~/stories/atom/AddressWithButton';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { useWalletPopoverV3Body } from './hooks';
import './style.css';

export interface WalletPopoverMainProps {
  onPopoverClose: () => unknown;
}

export default function WalletPopoverV3Body(props: WalletPopoverMainProps) {
  const { onPopoverClose } = props;
  const {
    onCreateAccount,
    onDisconnect,

    isLoading,

    chainName,

    accountExplorerUrl,

    assets,
    isAssetEmpty,
    onTokenRegister,

    formattedLps,
    isLiquidityTokenEmpty,

    walletAddress,
    onCopyWalletAddress,

    chromaticAddress,
    onCopyChromaticAddress,
    isChromaticAccountExist,

    onLpClick,
  } = useWalletPopoverV3Body();
  return (
    <div className="relative flex flex-col h-full WalletPopoverMain ">
      <Avatar src={arbitrumIcon} label={chainName} size="xl" fontSize="sm" gap="3" />
      <section className="flex flex-col flex-grow mt-6 box-inner">
        <article className="px-4 py-3 border-b bg-paper-light dark:bg-paper">
          <h4 className="mb-3 text-base text-center text-primary-lighter">Connected Wallet</h4>
          <div className="flex items-center justify-between gap-2">
            <AddressWithButton address={walletAddress} onClick={onCopyWalletAddress} />
            <Button
              href={accountExplorerUrl}
              label="view transition"
              css="light"
              size="lg"
              iconOnly={<OutlinkIcon />}
            />
          </div>
        </article>
        <div className="relative flex flex-col flex-auto w-full py-4 overflow-hidden dark:bg-inverted-lighter">
          <div className="wrapper-tabs">
            <Tab.Group>
              <Tab.List className="absolute left-0 w-full top-4 tabs-list tabs-line">
                <Tab className="w-[80px]">Assets</Tab>
                <Tab>Liquidity Tokens</Tab>
              </Tab.List>
              <Tab.Panels className="mt-[60px] pb-[60px] absolute bottom-0 px-4 overflow-auto h-[calc(100%-72px)] w-full">
                <Tab.Panel>
                  <article>
                    {isAssetEmpty ? (
                      <p className="text-center text-primary/20">You have no asset.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {assets.map(({ key, name, image, balance, explorerUrl }) => (
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
                              <Button
                                iconOnly={<PlusIcon className="w-3 h-3" />}
                                css="translucent"
                                gap="1"
                                size="xs"
                                onClick={() => {
                                  onTokenRegister(key);
                                }}
                              />
                            </div>

                            <div className="ml-auto text-right">
                              {/* TODO: Don't show prices of each token in USD */}
                              {/* <p className="text-sm text-primary-lighter">
                            <SkeletonElement isLoading={isLoading} width={40}>
                              ${usdPrice}
                            </SkeletonElement>
                          </p> */}
                              <p className="mt-1 text-base font-medium text-primary">
                                <SkeletonElement isLoading={isLoading} width={40}>
                                  {balance} {name}
                                </SkeletonElement>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                </Tab.Panel>
                <Tab.Panel>
                  <article>
                    {isLiquidityTokenEmpty ? (
                      <p className="text-center text-primary/20">You have no liquidity token.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {formattedLps.map(
                          ({ key, name, clpSymbol, token, market, tokenImage, balance }) => (
                            <Link
                              to="#"
                              key={key}
                              onClick={() => {
                                onLpClick(token, market);
                              }}
                            >
                              <div className="flex gap-3 pb-3 border-b last:border-b-0">
                                <SkeletonElement
                                  isLoading={isLoading}
                                  circle
                                  width={40}
                                  height={40}
                                >
                                  <Avatar size="xl" src={tokenImage} />
                                </SkeletonElement>
                                <div className="flex-1 gap-3">
                                  <div className="flex flex-col gap-1 leading-none">
                                    <SkeletonElement isLoading={isLoading} width={100}>
                                      <p className="font-semibold">
                                        {token}
                                        <span className="px-1 font-light text-primary-lighter">
                                          |
                                        </span>
                                        {market}
                                      </p>
                                    </SkeletonElement>
                                    <SkeletonElement isLoading={isLoading} width={100}>
                                      <p className="text-primary-lighter">
                                        {/* pool name */}
                                        {name}
                                      </p>
                                    </SkeletonElement>
                                    <SkeletonElement isLoading={isLoading} width={60}>
                                      <p className="mt-1 font-medium break-all text-primary">
                                        {/* {liquidity} {name} */}
                                        {balance} {clpSymbol}
                                      </p>
                                    </SkeletonElement>
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
        </div>
      </section>
      <section className="mt-10 mb-5 box-inner">
        <article className="px-4 py-3 bg-paper-light dark:bg-paper">
          {isChromaticAccountExist ? (
            <>
              <h4 className="mb-3 text-base text-center text-primary-lighter">My Account</h4>
              <div className="flex items-center justify-between gap-2">
                <AddressWithButton address={chromaticAddress} onClick={onCopyChromaticAddress} />
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
          onPopoverClose();
        }}
        size="xl"
        css="active"
        className="w-full mb-3 border-none"
      />
      <Button
        label="close popover"
        iconOnly={<ChevronDoubleRightIcon />}
        onClick={onPopoverClose}
        size="lg"
        css="unstyled"
        className="absolute left-0 t-10 ml-[-60px] text-primary-light"
      />
    </div>
  );
}
