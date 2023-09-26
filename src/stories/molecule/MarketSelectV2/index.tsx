import './style.css';

import { Popover } from '@headlessui/react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import ArrowTriangleIcon from '~/assets/icons/ArrowTriangleIcon';
import OutlinkIcon from '~/assets/icons/OutlinkIcon';
import { Avatar } from '~/stories/atom/Avatar';
import { BookmarkButton } from '~/stories/atom/BookmarkButton';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';

import { isNotNil } from 'ramda';
import { useMarketSelectV2 } from './hooks';

export function MarketSelectV2() {
  const {
    isLoading,
    tokenName,
    tokenImage,
    marketDescription,
    marketAddress,
    marketImage,
    tokens,
    markets,
    price,
    priceClass,
    priceClassMap,
    poolMap,
    interestRate,
    changeRate,
    changeRateClass,
    explorerUrl,
    isBookmarked,
    formattedElapsed,
    onBookmarkClick,
  } = useMarketSelectV2();

  return (
    <>
      <div className="relative MarketSelectV2 panel">
        <div className="flex items-center h-full gap-3">
          <BookmarkButton
            size="lg"
            onClick={() => {
              if (isNotNil(marketAddress) && isNotNil(onBookmarkClick)) {
                onBookmarkClick({
                  tokenName,
                  marketAddress,
                  marketDescription,
                });
              }
            }}
            isMarked={isNotNil(marketAddress) && isBookmarked?.[marketAddress]}
          />
          <Popover className="h-full">
            {({ open }) => (
              <>
                <Popover.Button className="flex items-center h-full gap-3 pr-5 border-r">
                  <div className="pr-3 border-r">
                    <div className="flex items-center gap-1">
                      <SkeletonElement isLoading={isLoading} circle width={24} height={24} />
                      <SkeletonElement
                        isLoading={isLoading}
                        width={60}
                        containerClassName="text-2xl"
                      >
                        <Avatar
                          label={tokenName}
                          src={tokenImage}
                          fontSize="2xl"
                          gap="1"
                          size="base"
                        />
                      </SkeletonElement>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <SkeletonElement isLoading={isLoading} circle width={24} height={24} />
                      <SkeletonElement
                        isLoading={isLoading}
                        width={80}
                        containerClassName="text-2xl"
                      >
                        <Avatar
                          label={marketDescription}
                          src={marketImage}
                          fontSize="2xl"
                          gap="1"
                          size="base"
                        />
                      </SkeletonElement>
                    </div>
                  </div>
                  <ArrowTriangleIcon
                    className={`w-4 h-4 ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </Popover.Button>
                <Popover.Panel className="popover-panel">
                  <div className="flex justify-between gap-20 px-3 py-2 text-left border-b tr text-primary-lighter bg-inverted-lighter">
                    <div className="flex">
                      <div className="min-w-[128px] border-r">Settlement token</div>
                      <div className="pl-3">Index</div>
                    </div>
                    <div className="flex pr-3 text-left">
                      <div className="w-[80px]">Long LP</div>
                      <div className="w-[80px]">Short LP</div>
                    </div>
                  </div>
                  <section className="flex flex-auto w-full px-3">
                    <article className="flex flex-col gap-2 py-3 pr-3 mr-3 border-r min-w-[128px]">
                      {tokens.map(({ key, isSelectedToken, onClickToken, name, image }) => (
                        <button
                          key={key}
                          className={`flex items-center gap-2 px-3 py-2 w-[116px] border ${
                            isSelectedToken ? 'bg-paper-light rounded-lg' : 'border-transparent'
                          }`}
                          onClick={onClickToken}
                          title={name}
                        >
                          <Avatar label={name} src={image} fontSize="lg" gap="2" size="base" />
                          {isSelectedToken && <ArrowTriangleIcon className="w-4 -rotate-90" />}
                        </button>
                      ))}
                    </article>

                    <article className="flex flex-col flex-auto gap-2 py-3">
                      {!isLoading &&
                        markets.map(
                          ({
                            key,
                            isSelectedMarket,
                            onClickMarket,
                            description,
                            price,
                            settlementToken,
                            image,
                          }) => (
                            <div key={key} className="relative flex items-center w-full">
                              <BookmarkButton
                                className="absolute left-0 ml-2"
                                onClick={() => {
                                  onBookmarkClick?.({
                                    tokenName: settlementToken!,
                                    marketAddress: key,
                                    marketDescription: description,
                                  });
                                }}
                                isMarked={isBookmarked?.[key]}
                              />
                              <button
                                className={`w-full flex items-center justify-between gap-3 pl-8 py-2 pr-3 border ${
                                  isSelectedMarket
                                    ? 'bg-paper-light rounded-lg'
                                    : 'border-transparent'
                                }`}
                                onClick={onClickMarket}
                              >
                                <span className="flex items-center justify-between flex-auto gap-10">
                                  <Avatar
                                    label={description}
                                    src={image}
                                    fontSize="lg"
                                    gap="2"
                                    size="base"
                                  />
                                  <span className={priceClassMap?.[key]}>${price}</span>
                                </span>
                                <span className="flex pl-3 text-left border-l text-primary-light">
                                  <span className="w-[80px]">{poolMap?.[key]?.longLpSum}</span>
                                  <span className="w-[80px]">{poolMap?.[key]?.shortLpSum}</span>
                                </span>
                              </button>
                            </div>
                          )
                        )}
                    </article>
                  </section>
                  {/* todo later : create new market */}
                  <div className="flex items-center justify-between px-3 py-2 border-t">
                    <Button
                      label="Create a new market"
                      iconLeft={<PlusCircleIcon />}
                      css="unstyled"
                      size="sm"
                      className="!p-0 !inline-flex !h-auto"
                    />
                    <p className="text-sm text-primary-light">3 markets are on the process</p>
                  </div>
                </Popover.Panel>
              </>
            )}
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
        <div className="flex items-stretch gap-5 text-right font-regular">
          <div className="flex flex-col gap-[2px]">
            <div className="flex">
              <p className="text-sm text-primary-light">Last update</p>
            </div>
            <h4>
              <SkeletonElement isLoading={isLoading} width={80}>
                {formattedElapsed}
              </SkeletonElement>
            </h4>
          </div>
          <div className="flex flex-col gap-[2px]">
            <div className="flex">
              <p className="text-sm text-primary-light">24H Change</p>
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
                <span className={changeRateClass}>{changeRate}</span>
              </SkeletonElement>
            </h4>
          </div>
          <div className="flex flex-col gap-[2px]">
            <div className="flex">
              <p className="text-sm text-primary-light">Interest Rate</p>
              <TooltipGuide
                label="interest-rate"
                tip="This is the rate of Borrow Fee that needs to be paid to the LP while the position is open. The Interest Rate is determined by the Dao for each settlement asset."
                outLink="https://chromatic-protocol.gitbook.io/docs/fee/interest"
                className="mr-0"
                iconClass="!w-3"
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
