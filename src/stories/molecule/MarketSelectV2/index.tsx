import './style.css';

import { Popover } from '@headlessui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Avatar } from '~/stories/atom/Avatar';
import OutlinkIcon from '~/assets/icons/OutlinkIcon';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { BookmarkButton } from '~/stories/atom/BookmarkButton';
import IncreaseIcon from '~/assets/icons/IncreaseIcon';
import DecreaseIcon from '~/assets/icons/DecreaseIcon';

import { useMarketSelectV2 } from './hooks';

export function MarketSelectV2() {
  const {
    isLoading,
    tokenName,
    marketDescription,
    tokens,
    markets,
    price,
    priceClass,
    interestRate,
    explorerUrl,
  } = useMarketSelectV2();

  return (
    <>
      <div className="relative MarketSelectV2 panel">
        <div className="flex items-center gap-3">
          <BookmarkButton size="lg" />
          <Popover>
            <Popover.Button className="flex items-center h-20 gap-3 pr-5 border-r">
              <div className="pr-3 border-r">
                <div className="flex items-center gap-1">
                  <SkeletonElement isLoading={isLoading} circle width={24} height={24} />
                  <SkeletonElement isLoading={isLoading} width={60} containerClassName="text-2xl">
                    <Avatar label={tokenName} fontSize="2xl" gap="1" size="sm" />
                  </SkeletonElement>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <SkeletonElement isLoading={isLoading} circle width={24} height={24} />
                  <SkeletonElement isLoading={isLoading} width={80} containerClassName="text-2xl">
                    <Avatar label={marketDescription} fontSize="2xl" gap="1" size="sm" />
                  </SkeletonElement>
                </div>
              </div>
              <ChevronDownIcon
                className="w-5 h-5 transition duration-150 ease-in-out"
                aria-hidden="true"
              />
            </Popover.Button>
            <Popover.Panel className="popover-panel">
              <p className="text-primary-lighter">Select Market</p>
              <section className="flex flex-auto w-full py-3">
                <article className="flex flex-col pr-3 mr-3 border-r">
                  {tokens.map(({ key, isSelectedToken, onClickToken, name }) => (
                    <button
                      key={key}
                      className={`flex items-center gap-2 px-4 py-2 ${
                        isSelectedToken && 'border bg-paper-lighter rounded-lg' // the token selected
                      }`}
                      onClick={onClickToken}
                      title={name}
                    >
                      <Avatar label={name} fontSize="lg" gap="2" size="sm" />
                      {isSelectedToken && <ChevronRightIcon className="w-4" />}
                    </button>
                  ))}
                </article>

                <article className="flex flex-col flex-auto">
                  {markets.map(({ key, isSelectedMarket, onClickMarket, description, price }) => (
                    <div className="relative flex items-center w-full">
                      <BookmarkButton className="absolute left-0 ml-2" />
                      <button
                        key={key}
                        className={`w-full flex items-center justify-between gap-12 pl-8 py-2 pr-3 ${
                          isSelectedMarket && 'border bg-paper-lighter rounded-lg'
                        }`}
                        onClick={onClickMarket}
                      >
                        <Avatar label={description} fontSize="lg" gap="2" size="sm" />
                        <span>${price}</span>
                      </button>
                    </div>
                  ))}
                </article>
              </section>
            </Popover.Panel>
          </Popover>
          <h2 className={`text-3xl ml-2 ${priceClass}`}>
            <SkeletonElement isLoading={isLoading} width={80}>
              <span className="flex items-center gap-1">
                ${price}
                {/* if price goes higher than previous round */}
                {/* <span className="text-price-higher">
                  <IncreaseIcon />
                </span> */}
                {/* if price goes lower than previous round */}
                {/* <span className="text-price-lower">
                  <DecreaseIcon />
                </span> */}
              </span>
            </SkeletonElement>
          </h2>
        </div>
        <div className="flex items-stretch gap-5 text-right text-primary-light font-regular">
          <div className="flex flex-col gap-1">
            <div className="flex">
              <p>Last update</p>
            </div>
            <h4>
              <SkeletonElement isLoading={isLoading} width={80}>
                00:00:00
              </SkeletonElement>
            </h4>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex">
              <p>24H Change</p>
              {/* <TooltipGuide
                label="24h-change"
                tip=""
                outLink="https://chromatic-protocol.gitbook.io/docs/fee/interest"
                className="mr-0"
              /> */}
            </div>
            <h4>
              <SkeletonElement isLoading={isLoading} width={80}>
                {/* span className */}
                {/* if value > 0 : text-price-higher */}
                {/* if value < 0 : text-price-lower */}
                <span className={`text-price-higher`}>+0.01%</span>
              </SkeletonElement>
            </h4>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex">
              <p>Interest Rate</p>
              <TooltipGuide
                label="interest-rate"
                tip="This is the rate of Borrow Fee that needs to be paid to the LP while the position is open. The Interest Rate is determined by the Dao for each settlement asset."
                outLink="https://chromatic-protocol.gitbook.io/docs/fee/interest"
                className="mr-0"
              />
            </div>
            <h4>
              <SkeletonElement isLoading={isLoading} width={80}>
                {interestRate}%/h
              </SkeletonElement>
            </h4>
          </div>
          <div className="flex pl-3 mr-3 border-l">
            <Button
              css="unstyled"
              iconOnly={<OutlinkIcon />}
              className="self-center"
              href={explorerUrl}
            />
          </div>
        </div>
      </div>
    </>
  );
}
