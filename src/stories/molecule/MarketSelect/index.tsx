import './style.css';

import { Popover } from '@headlessui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import OutlinkIcon from '~/assets/icons/OutlinkIcon';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { useMarketSelect } from './hooks';

export function MarketSelect() {
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
    beforeDayPrice,
  } = useMarketSelect();

  return (
    <>
      <div className="relative MarketSelect">
        <Popover>
          <Popover.Button className="flex items-center gap-3 ml-10">
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
          <Popover.Panel className="flex popover-panel">
            <section className="flex w-full py-4 border-t">
              <article className="flex flex-col pr-6 mr-6 border-r">
                {tokens.map(({ key, isSelectedToken, onClickToken, name }) => (
                  <button
                    key={key}
                    className={`flex items-center gap-2 px-4 py-2 ${
                      isSelectedToken && 'text-inverted bg-primary rounded-lg' // the token selected
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
                  <button
                    key={key}
                    className={`flex items-center justify-between gap-4 px-4 py-2 ${
                      isSelectedMarket && 'text-inverted bg-primary rounded-lg'
                    }`}
                    onClick={onClickMarket}
                  >
                    <Avatar label={description} fontSize="lg" gap="2" size="sm" />
                    <div className="flex flex-col gap-y-0.5">
                      <p>${price}</p>
                      <p className="text-[6px]">24H ${beforeDayPrice}</p>
                    </div>
                  </button>
                ))}
              </article>
            </section>
          </Popover.Panel>
        </Popover>
        <div className="flex items-center gap-5 mr-10">
          <h2 className={`text-3xl h-full self-center ${priceClass}`}>
            <SkeletonElement isLoading={isLoading} width={80}>
              ${price}
              <p className="text-xs">24H ${beforeDayPrice}</p>
            </SkeletonElement>
          </h2>
          <div className="flex flex-col gap-1 pl-5 text-left border-l text-primary-light">
            <h4>
              <SkeletonElement isLoading={isLoading} width={80}>
                {interestRate}%/h
              </SkeletonElement>
            </h4>
            <div className="flex">
              <p>Interest Rate</p>
              <TooltipGuide
                label="interest-rate"
                tip="This is the rate of Borrow Fee that needs to be paid to the LP while the position is open. The Interest Rate is determined by the Dao for each settlement asset."
                outLink="https://chromatic-protocol.gitbook.io/docs/fee/interest"
                className="mr-0"
              />
            </div>
          </div>
          <div className="flex pl-3 mr-3 border-l text-primary-light">
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
