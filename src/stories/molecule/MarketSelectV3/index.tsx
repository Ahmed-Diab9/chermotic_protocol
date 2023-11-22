import './style.css';

import { Popover } from '@headlessui/react';
import { ArrowTriangleIcon, OutlinkIcon } from '~/assets/icons/Icon';
import { Avatar } from '~/stories/atom/Avatar';
import { BookmarkButton } from '~/stories/atom/BookmarkButton';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';

import { isNil, isNotNil } from 'ramda';
import { Suspense, lazy } from 'react';
import { useMarketSelectV3 } from './hooks';

const MarketSelectV3Main = lazy(() => import('~/stories/molecule/MarketSelectV3Body'));

export function MarketSelectV3() {
  const {
    isLoading,
    isPriceLoading,
    isBookmarkeds,
    token,
    market,
    price,
    priceClass,
    interestRate,
    changeRate,
    changeRateClass,
    explorerUrl,
    formattedElapsed,
    onBookmarkClick,
  } = useMarketSelectV3();

  return (
    <>
      <div className="relative MarketSelectV3 panel panel-transparent">
        <div className="flex items-center gap-3">
          <BookmarkButton
            size="lg"
            onClick={() => {
              if (isNotNil(onBookmarkClick) && isNotNil(token) && isNotNil(market)) {
                onBookmarkClick({
                  id: `${token.name}:${market.description}`,
                  tokenName: token.name,
                  tokenAddress: token.address,
                  marketDescription: market.description,
                  marketAddress: market.address,
                });
              }
            }}
            isMarked={
              isNotNil(token) &&
              isNotNil(market) &&
              isBookmarkeds?.[`${token.name}:${market.description}`]
            }
          />
          <Popover className="h-full">
            {({ open, close }) => (
              <>
                <Popover.Button className="flex items-center h-full gap-3">
                  <div className="flex items-center gap-1">
                    <SkeletonElement isLoading={isLoading} circle width={24} height={24} />
                    <SkeletonElement
                      isLoading={isLoading || isNil(token?.name) || isNil(market?.description)}
                      width={60}
                      containerClassName="text-2xl"
                    >
                      <Avatar
                        label={token?.name}
                        src={token?.image}
                        fontSize="xl"
                        gap="1"
                        size="base"
                      />
                    </SkeletonElement>
                  </div>
                  <div className="flex items-center gap-1">
                    <SkeletonElement isLoading={isLoading} circle width={24} height={24} />
                    <SkeletonElement
                      isLoading={isLoading || isNil(token?.name) || isNil(market?.description)}
                      width={80}
                      containerClassName="text-2xl"
                    >
                      <Avatar
                        label={market?.description}
                        src={market?.image}
                        fontSize="xl"
                        gap="1"
                        size="base"
                      />
                    </SkeletonElement>
                  </div>

                  <ArrowTriangleIcon
                    className={`w-4 h-4 ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </Popover.Button>
                <Suspense>
                  <MarketSelectV3Main onMouseLeave={close} />
                </Suspense>
              </>
            )}
          </Popover>
          {/* <h2 className={`text-3xl ml-2 ${priceClass}`}>
            <SkeletonElement isLoading={isLoading} width={80}>
              <span className="flex items-center gap-1">${price}</span>
            </SkeletonElement>
          </h2> */}
        </div>
        <div className="flex justify-between mt-3">
          <h2 className={`text-[40px] ${priceClass}`}>
            <SkeletonElement isLoading={isPriceLoading} width={80}>
              <span className="flex items-center gap-1">${price}</span>
            </SkeletonElement>
          </h2>
          <div className="flex items-center gap-5">
            <div className="flex gap-5 text-right font-regular">
              <div className="flex flex-col gap-[2px]">
                <div className="flex">
                  <p className="text-sm text-primary-light">Last update</p>
                </div>
                <h4>
                  <SkeletonElement isLoading={isLoading} width={60}>
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
                  <SkeletonElement isLoading={isLoading} width={60}>
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
                    tip="This is the rate of Borrow Fee that needs to be paid to the LP while the position is open. The Interest Rate is determined by the Dao for each settlement token."
                    outLink="https://chromatic-protocol.gitbook.io/docs/fee/interest"
                    className="mr-0"
                    iconClass="!w-3"
                    place="top"
                  />
                </div>
                <h4>
                  <SkeletonElement isLoading={isLoading} width={60}>
                    {interestRate}%/h
                  </SkeletonElement>
                </h4>
              </div>
            </div>
            {/* <div className="flex pl-3"> */}
            <div className="flex pl-3 mr-0 border-l border-primary/10">
              <Button
                css="unstyled"
                iconOnly={<OutlinkIcon />}
                className="self-center text-primary-light"
                href={explorerUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
