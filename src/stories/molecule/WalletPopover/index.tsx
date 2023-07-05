import './style.css';
import '../../atom/Tabs/style.css';
import { Popover, Tab, Transition } from '@headlessui/react';
import { ArrowTopRightOnSquareIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { BigNumber } from 'ethers';
import { Fragment } from 'react';
import { AddressCopyButton } from '~/stories/atom/AddressCopyButton';
import { Account } from '../../../typings/account';
import { Market, Price, Token } from '../../../typings/market';
import { LiquidityPoolSummary } from '../../../typings/pools';
import { trimAddress } from '../../../utils/address';
import { Logger } from '../../../utils/log';
import { expandDecimals, formatBalance, formatDecimals, withComma } from '../../../utils/number';
import { isValid } from '../../../utils/valid';
import { Avatar } from '../../atom/Avatar';
import { Button } from '../../atom/Button';
import { Link } from 'react-router-dom';
import { Thumbnail } from '../../atom/Thumbnail';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import arbitrumIcon from '/src/assets/images/arbitrum.svg';

const logger = Logger('WalletPopOver');
interface WalletPopoverProps {
  account?: Account;
  tokens?: Token[];
  markets?: Market[];
  balances?: Record<string, BigNumber>;
  priceFeed?: Record<string, Price>;
  pools?: LiquidityPoolSummary[];
  isLoading?: boolean;
  onConnect?: () => unknown;
  onDisconnect?: () => unknown;
  onCreateAccount?: () => void;
  onClick?: () => void;
  onWalletCopy?: (text: string) => unknown;
  onUsumCopy?: (text: string) => unknown;
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
  onUsumCopy,
  ...props
}: WalletPopoverProps) => {
  // logger.info('[WalletPopover]', tokens, priceFeed, balances);
  // logger.info(`[${WalletPopover.name}]`, pools);
  return (
    <div className={`WalletPopover popover text-right`}>
      <Popover>
        {({ open, close }) => (
          <>
            <Popover.Button className="p-[2px] pr-5 border rounded-full bg-black border-grayL text-white min-w-[175px]">
              <Avatar
                label={account?.walletAddress && trimAddress(account?.walletAddress, 7, 5)}
                src={arbitrumIcon}
                className="!w-[36px] !h-[36px]"
                fontSize="sm"
                fontWeight="normal"
                gap="3"
              />
            </Popover.Button>
            {/* backdrop */}
            <Popover.Overlay className="fixed inset-0 backdrop bg-white/80" />
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-50 translate-x-20"
              enterTo="opacity-100 translate-x-0"
              leave="transition ease-in duration-0"
              // leaveFrom="opacity-100 translate-x-20"
              // leaveTo="opacity-100 translate-x-0"
            >
              <Popover.Panel className="transform border-l shadow-xl shadow-white popover-panel">
                <div className="relative flex flex-col h-full ">
                  {/* Network */}
                  <Avatar
                    src={arbitrumIcon}
                    label="Arbitrum Network"
                    size="lg"
                    fontSize="sm"
                    gap="3"
                  />
                  {/* box - top */}
                  <section className="flex flex-col flex-grow mt-6 overflow-hidden border rounded-lg">
                    {/* Wallet address */}
                    <article className="px-4 py-3 border-b bg-grayL/20">
                      <h4 className="mb-3 text-base text-center text-black/30">Connected Wallet</h4>
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
                          label="view transition"
                          css="circle"
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
                              <div className="flex flex-col gap-3">
                                {balances &&
                                  priceFeed &&
                                  tokens?.map((token) => (
                                    <div key={token.address} className="flex items-center">
                                      {isLoading ? (
                                        <div className="flex items-center gap-1">
                                          <Skeleton
                                            circle
                                            containerClassName="avatar-skeleton w-4 text-lg"
                                          />
                                          <Skeleton width={40} containerClassName="leading-none" />
                                        </div>
                                      ) : (
                                        <Avatar
                                          label={token.name}
                                          size="xs"
                                          fontSize="base"
                                          gap="1"
                                        />
                                      )}
                                      <div className="ml-auto text-right">
                                        <p className="text-sm text-black/30">
                                          {isLoading ? (
                                            <Skeleton
                                              width={40}
                                              containerClassName="leading-none"
                                            />
                                          ) : (
                                            <>
                                              $
                                              {withComma(
                                                formatBalance(
                                                  balances[token.name],
                                                  token,
                                                  priceFeed[token.name]
                                                )
                                              )}
                                            </>
                                          )}
                                        </p>
                                        <p className="mt-1 text-base font-medium text-gray-900">
                                          {isLoading ? (
                                            <Skeleton
                                              width={40}
                                              containerClassName="leading-none"
                                            />
                                          ) : (
                                            <>
                                              {withComma(
                                                balances[token.name]
                                                  .div(expandDecimals(token.decimals))
                                                  .toString()
                                              )}{' '}
                                              {token.name}
                                            </>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </article>
                          </Tab.Panel>
                          <Tab.Panel>
                            {/* Liquidity NFT */}
                            <article>
                              <div className="flex flex-col gap-3">
                                {pools?.map((pool, poolIndex) => (
                                  <Link to="#">
                                    <div
                                      key={`${pool.token}-${pool.market}`}
                                      className="flex gap-3 pb-3 border-b last:border-b-0"
                                    >
                                      {isLoading ? (
                                        <Skeleton
                                          circle
                                          containerClassName="avatar-skeleton w-10 text-[40px]"
                                        />
                                      ) : (
                                        <Avatar size="lg" src={undefined} />
                                      )}
                                      <div className="flex-1">
                                        <div className="flex gap-2 leading-none">
                                          {isLoading ? (
                                            <Skeleton containerClassName="flex-1" width={120} />
                                          ) : (
                                            <>
                                              <p>{pool.token.name}</p>
                                              <span className="px-1 text-grayL">|</span>
                                              <p>{pool.market}</p>
                                            </>
                                          )}
                                        </div>
                                        <div className="flex mt-3">
                                          <div className="mr-auto">
                                            <p className="text-base font-medium text-black/30">
                                              {isLoading ? (
                                                <Skeleton containerClassName="flex-1" width={80} />
                                              ) : (
                                                <>
                                                  {formatDecimals(
                                                    pool.liquidity,
                                                    pool.token.decimals,
                                                    2
                                                  )}{' '}
                                                  {pool.token.name}
                                                </>
                                              )}
                                            </p>
                                            <p className="mt-2 text-base text-black">
                                              {isLoading ? (
                                                <Skeleton containerClassName="flex-1" width={80} />
                                              ) : (
                                                <>{pool.bins} Bins</>
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </article>
                          </Tab.Panel>
                        </Tab.Panels>
                      </Tab.Group>
                    </div>
                  </section>
                  {/* box - bottom */}
                  {/* Account address */}
                  <article className="px-4 py-3 mt-10 mb-5 border rounded-lg bg-grayL/20">
                    <h4 className="mb-3 text-base text-center text-black/30">My Account</h4>
                    <div className="flex items-center justify-between gap-2">
                      <AddressCopyButton
                        address={
                          account?.usumAddress
                            ? trimAddress(account?.usumAddress, 7, 5)
                            : 'Create Account'
                        }
                        onClick={() => {
                          const address = account?.usumAddress;
                          if (isValid(address)) {
                            onUsumCopy?.(address);
                          }
                        }}
                      />
                      <Button
                        label="view transition"
                        css="circle"
                        size="lg"
                        iconOnly={<ArrowTopRightOnSquareIcon />}
                      />
                    </div>
                  </article>
                  <Button
                    label="Disconnect"
                    onClick={onDisconnect}
                    size="xl"
                    className="w-full mb-3 !text-white !bg-black border-none"
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
