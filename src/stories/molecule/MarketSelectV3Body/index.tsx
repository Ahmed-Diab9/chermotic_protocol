import './style.css';

import { Popover } from '@headlessui/react';
import { ArrowTriangleIcon } from '~/assets/icons/Icon';
import { Avatar } from '~/stories/atom/Avatar';
import { BookmarkButton } from '~/stories/atom/BookmarkButton';

import { isNotNil } from 'ramda';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { useMarketSelectV3Body } from './hooks';

export interface MarketSelectV3BodyProps {
  onMouseLeave?: () => unknown;
}

const MarketSelectV3Body = (props: MarketSelectV3BodyProps) => {
  const { onMouseLeave } = props;
  const { isLoading, tokens, markets, priceClassMap, poolMap, onBookmarkClick } =
    useMarketSelectV3Body();

  return (
    <Popover.Panel className="popover-panel" onMouseLeave={onMouseLeave}>
      <div className="flex items-stretch justify-between h-8 gap-20 px-3 text-left border-b tr text-primary-lighter bg-inverted-lighter">
        <div className="flex items-stretch">
          <div className="min-w-[136px] border-r flex items-center">Settlement token</div>
          <div className="self-center pl-3">Index</div>
        </div>
        <div className="flex items-center pr-3 text-left">
          <div className="w-[80px]">Long LP</div>
          <div className="w-[80px]">Short LP</div>
        </div>
      </div>
      <section className="flex flex-auto w-full px-3">
        <article className="flex flex-col gap-2 py-3 pr-3 mr-3 border-r min-w-[136px]">
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
          {markets.map(
            ({
              key,
              isSelectedMarket,
              onClickMarket,
              token,
              price,
              isBookmarked,
              description,
              address,
              image,
            }) => (
              <SkeletonElement
                key={key}
                isLoading={isLoading}
                containerClassName="pt-1 py-3 mb-2"
                className="py-1"
              >
                <div key={key} className="relative flex items-center w-full">
                  <BookmarkButton
                    className="absolute left-0 ml-2"
                    onClick={() => {
                      if (isNotNil(token) && !isLoading) {
                        onBookmarkClick?.({
                          id: `${token.name}:${description}`,
                          tokenName: token.name,
                          tokenAddress: token.address,
                          marketDescription: description,
                          marketAddress: address,
                        });
                      }
                    }}
                    isMarked={isBookmarked}
                  />
                  <button
                    className={`w-full flex items-center justify-between gap-3 pl-8 py-2 pr-3 border ${
                      isSelectedMarket ? 'bg-paper-light rounded-lg' : 'border-transparent'
                    }`}
                    onClick={onClickMarket}
                    disabled={isLoading}
                  >
                    <span className="flex items-center justify-between flex-auto gap-10">
                      <Avatar label={description} src={image} fontSize="lg" gap="2" size="base" />
                      <span className={priceClassMap?.[key]}>${price}</span>
                    </span>
                    <span className="flex pl-3 text-left border-l text-primary-light">
                      <span className="w-[80px]">{poolMap?.[key]?.longLpSum}</span>
                      <span className="w-[80px]">{poolMap?.[key]?.shortLpSum}</span>
                    </span>
                  </button>
                </div>
              </SkeletonElement>
            )
          )}
        </article>
      </section>
      {/* todo later : create new market */}
      {/* <div className="flex items-center justify-between px-3 py-2 border-t">
        <Button
          label="Create a new market"
          iconLeft={<PlusCircleIcon />}
          css="unstyled"
          size="sm"
          className="!p-0 !inline-flex !h-auto"
        />
        <p className="text-sm text-primary-light">3 markets are on the process</p>
      </div> */}
    </Popover.Panel>
  );
};

export default MarketSelectV3Body;
