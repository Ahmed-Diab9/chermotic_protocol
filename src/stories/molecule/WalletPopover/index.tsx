import { Popover, Tab, Transition } from '@headlessui/react';
import { ArrowTopRightOnSquareIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { isNil } from 'ramda';
import { Fragment, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePublicClient } from 'wagmi';
import { AddressCopyButton } from '~/stories/atom/AddressCopyButton';
import { PRICE_FEED } from '../../../configs/token';
import { Account } from '../../../typings/account';
import { Market, Price, Token } from '../../../typings/market';
import { LiquidityPoolSummary } from '../../../typings/pools';
import { ADDRESS_ZERO, trimAddress } from '../../../utils/address';
import { Logger } from '../../../utils/log';
import { formatBalance, formatDecimals, withComma } from '../../../utils/number';
import { isValid } from '../../../utils/valid';
import { Avatar } from '../../atom/Avatar';
import { Button } from '../../atom/Button';
import { SkeletonElement } from '../../atom/SkeletonElement';
import '../../atom/Tabs/style.css';
import './style.css';
import arbitrumIcon from '/src/assets/images/arbitrum.svg';

const logger = Logger('WalletPopOver');
interface WalletPopoverProps {
  account?: Account;
  tokens?: Token[];
  markets?: Market[];
  balances?: Record<string, bigint>;
  priceFeed?: Record<string, Price>;
  pools?: LiquidityPoolSummary[];
  isLoading?: boolean;
  onConnect?: () => unknown;
  onDisconnect?: () => unknown;
  onCreateAccount?: () => void;
  onClick?: () => void;
  onWalletCopy?: (text: string) => unknown;
  onChromaticCopy?: (text: string) => unknown;
}

export const WalletPopover = ({
  account,
  tokens,
  markets,
  balances,
  priceFeed,
  pools,
  isLoading,
  onConnect,
  onDisconnect,
  onCreateAccount,
  onWalletCopy,
  onChromaticCopy,
  ...props
}: WalletPopoverProps) => {
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

  const usdcPrice = useCallback(
    (token: Token) => {
      if (!balances || !priceFeed) return '';
      const priceFeedAddress = PRICE_FEED[token.name] || '0x';
      if (isValid(balances[token.address]) && isValid(priceFeed[priceFeedAddress])) {
        return `${withComma(
          formatBalance(balances[token.address], token, priceFeed[priceFeedAddress])
        )}`;
      }
      return '';
    },
    [balances, priceFeed]
  );

  return (
    <div className={`WalletPopover popover text-right`}>
      <Popover>
        {({ open, close }) => (
          <>
            <Popover.Button className="btn btn-wallet min-w-[175px]">
              <Avatar
                label={account?.walletAddress && trimAddress(account?.walletAddress, 7, 5)}
                src={arbitrumIcon}
                className="!w-[36px] !h-[36px]"
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
                  {/* Network */}
                  <Avatar
                    src={arbitrumIcon}
                    label={publicClient.chain.name || 'Unknown'}
                    size="lg"
                    fontSize="sm"
                    gap="3"
                  />
                  {/* box - top */}
                  <section className="flex flex-col flex-grow mt-6 overflow-hidden border rounded-lg">
                    {/* Wallet address */}
                    <article className="px-4 py-3 border-b bg-paper-lighter">
                      <h4 className="mb-3 text-base text-center text-primary-lighter">
                        Connected Wallet
                      </h4>
                      <div className="flex items-center justify-between gap-2">
                        <AddressCopyButton
                          address={
                            account?.walletAddress
                              ? trimAddress(account?.walletAddress, 7, 5)
                              : 'Create Account'
                          }
                          onClick={() => {
                            const address = account?.walletAddress;
                            if (isValid(address)) {
                              onWalletCopy?.(address);
                            }
                          }}
                        />
                        <Button
                          href={
                            account?.walletAddress && blockExplorer
                              ? `${blockExplorer}/address/${account?.walletAddress}`
                              : undefined
                          }
                          label="view transition"
                          css="light"
                          size="lg"
                          iconOnly={<ArrowTopRightOnSquareIcon />}
                        />
                      </div>
                    </article>
                    {/* Tab - Asset, Liquidity */}
                    <div className="relative flex flex-col flex-auto w-full py-4 overflow-hidden tabs tabs-line">
                      <Tab.Group>
                        {/* tab - menu */}
                        <Tab.List className="absolute left-0 w-full top-4">
                          <Tab className="w-[80px]">Assets</Tab>
                          <Tab>Liquidity Token</Tab>
                        </Tab.List>
                        {/* tab - contents */}
                        <Tab.Panels className="mt-[60px] pb-[60px] absolute bottom-0 px-4 overflow-auto h-[calc(100%-72px)] w-full">
                          <Tab.Panel>
                            {/* Assets */}
                            <article>
                              {tokens?.length === 0 ? (
                                <p className="text-center text-gray-light">You have no asset.</p>
                              ) : (
                                <div className="flex flex-col gap-3">
                                  {balances &&
                                    priceFeed &&
                                    tokens?.map((token) => (
                                      <div key={token.address} className="flex items-center">
                                        <div className="flex items-center gap-1">
                                          <SkeletonElement
                                            isLoading={isLoading}
                                            circle
                                            width={24}
                                            height={24}
                                          />
                                          <SkeletonElement isLoading={isLoading} width={40}>
                                            <Avatar
                                              label={token.name}
                                              size="sm"
                                              fontSize="base"
                                              gap="2"
                                            />
                                          </SkeletonElement>
                                          <Button
                                            href={
                                              blockExplorer
                                                ? `${blockExplorer}/token/${token.address}`
                                                : undefined
                                            }
                                            iconOnly={<ArrowTopRightOnSquareIcon />}
                                            css="unstyled"
                                            size="sm"
                                            className="text-primary-light"
                                          />
                                        </div>

                                        <div className="ml-auto text-right">
                                          <p className="text-sm text-primary-lighter">
                                            <SkeletonElement isLoading={isLoading} width={40}>
                                              ${usdcPrice(token)}
                                            </SkeletonElement>
                                          </p>
                                          <p className="mt-1 text-base font-medium text-primary">
                                            <SkeletonElement isLoading={isLoading} width={40}>
                                              {formatDecimals(
                                                balances[token.address],
                                                token.decimals,
                                                5,
                                                true
                                              )}{' '}
                                              {token.name}
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
                            {/* Liquidity NFT */}
                            <article>
                              {tokens?.length === 0 ? (
                                <p className="text-center text-gray-light">
                                  You have no liquidity token.
                                </p>
                              ) : (
                                <div className="flex flex-col gap-3">
                                  {pools?.map((pool, poolIndex) => (
                                    <Link to="#" key={`${pool.token}-${pool.market}`}>
                                      <div className="flex gap-3 pb-3 border-b last:border-b-0">
                                        <SkeletonElement
                                          isLoading={isLoading}
                                          circle
                                          width={40}
                                          height={40}
                                        >
                                          <Avatar size="lg" src={undefined} />
                                        </SkeletonElement>
                                        <div className="flex-1">
                                          <div className="flex gap-2 leading-none">
                                            <SkeletonElement isLoading={isLoading} width={100}>
                                              <p>{pool.token.name}</p>
                                              <span className="px-1 text-gray-lighter">|</span>
                                              <p>{pool.market}</p>
                                            </SkeletonElement>
                                          </div>
                                          <div className="flex mt-3">
                                            <div className="mr-auto">
                                              <p className="text-base font-medium text-primary-lighter">
                                                <SkeletonElement isLoading={isLoading} width={80}>
                                                  {formatDecimals(
                                                    pool.liquidity,
                                                    pool.token.decimals,
                                                    2,
                                                    true
                                                  )}{' '}
                                                  {pool.token.name}
                                                </SkeletonElement>
                                              </p>
                                              <p className="mt-2 text-base text-primary">
                                                <SkeletonElement isLoading={isLoading} width={80}>
                                                  {pool.bins} Bins
                                                </SkeletonElement>
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </article>
                          </Tab.Panel>
                        </Tab.Panels>
                      </Tab.Group>
                    </div>
                  </section>
                  {/* box - bottom */}
                  {/* Account address */}
                  <article className="px-4 py-3 mt-10 mb-5 border rounded-lg bg-paper-lighter">
                    {account?.chromaticAddress && account?.chromaticAddress !== ADDRESS_ZERO ? (
                      <>
                        <h4 className="mb-3 text-base text-center text-primary-lighter">
                          My Account
                        </h4>
                        <div className="flex items-center justify-between gap-2">
                          <AddressCopyButton
                            address={
                              account?.chromaticAddress &&
                              trimAddress(account?.chromaticAddress, 7, 5)
                            }
                            onClick={() => {
                              const address = account?.chromaticAddress;
                              if (isValid(address)) {
                                onChromaticCopy?.(address);
                              }
                            }}
                          />
                          <Button
                            href={
                              account?.chromaticAddress && blockExplorer
                                ? `${blockExplorer}/address/${account?.chromaticAddress}`
                                : undefined
                            }
                            label="view transition"
                            css="light"
                            size="lg"
                            iconOnly={<ArrowTopRightOnSquareIcon />}
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
                  <Button
                    label="Disconnect"
                    onClick={onDisconnect}
                    size="xl"
                    css="active"
                    className="w-full mb-3 border-none"
                  />
                  <Button
                    label="close popover"
                    iconOnly={<ChevronDoubleRightIcon />}
                    onClick={() => {
                      close();
                    }}
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
};
