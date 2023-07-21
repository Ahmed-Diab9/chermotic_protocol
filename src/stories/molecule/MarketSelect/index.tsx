import { Popover } from '@headlessui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import './style.css';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { filterIfFulfilled } from '~/utils/array';
import { isValid } from '~/utils/valid';
import { Market, Token } from '../../../typings/market';
import { formatDecimals, withComma } from '../../../utils/number';
import { Avatar } from '../../atom/Avatar';
import { SkeletonElement } from '../../atom/SkeletonElement';

interface MarketSelectProps {
  tokens?: Token[];
  markets?: Market[];
  selectedToken?: Token;
  selectedMarket?: Market;
  feeRate?: bigint;
  isGroupLegacy?: boolean;
  isLoading?: boolean;
  onTokenClick?: (token: Token) => void;
  onMarketClick?: (market: Market) => void;
}

/**
 * FIXME
 * should remove the component `Legacy`.
 */
export const MarketSelect = ({ ...props }: MarketSelectProps) => {
  const { isGroupLegacy, selectedMarket, feeRate = BigInt(0), selectedToken, isLoading } = props;
  const oracleDecimals = 18;

  const marketPrice = useMemo(
    () =>
      `$${withComma(formatDecimals(selectedMarket?.oracleValue?.price || 0, oracleDecimals, 2))}`,
    [selectedMarket, selectedToken]
  );

  // TODO
  // 연이율(feeRate)을 문자열로 변환하는 과정이 올바른지 확인이 필요합니다.
  // 현재는 연이율을 1년에 해당하는 시간 값으로 나눗셈
  return (
    <>
      <div className="relative bg-white shadow-lg MarketSelect">
        <Popover>{!isGroupLegacy ? <PopoverMain {...props} /> : <PopoverGroupLegacy />}</Popover>
        <div className="flex items-center gap-4 mr-10">
          <div className="flex flex-col gap-1 pr-5 text-right border-r text-black/50">
            <h4>
              <SkeletonElement isLoading={isLoading} width={80}>
                {formatDecimals(((feeRate ?? 0n) * 100n) / (365n * 24n), 4, 4)}
                %/h
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
          <h2 className="text-3xl">
            <SkeletonElement isLoading={isLoading} width={80}>
              {marketPrice}
            </SkeletonElement>
          </h2>
        </div>
      </div>
    </>
  );
};

export const PopoverMain = (props: Omit<MarketSelectProps, 'isGroupLegacy'>) => {
  const { tokens, selectedToken, markets, selectedMarket, isLoading, onTokenClick, onMarketClick } =
    props;
  const [marketPrices, setMarketPrices] = useState<string[]>([]);
  const fetchPrices = useCallback(async () => {
    if (!isValid(markets)) {
      return;
    }
    const promise = markets.map(async (market) => {
      return '$' + withComma(formatDecimals(market.oracleValue.price, selectedToken?.decimals, 2));
    });
    const prices = await filterIfFulfilled(promise);
    setMarketPrices(prices);
  }, [markets]);
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);
  return (
    <>
      <Popover.Button className="flex items-center gap-3 ml-10">
        <div className="pr-3 border-r">
          <div className="flex items-center gap-1">
            <SkeletonElement isLoading={isLoading} circle width={24} height={24} />
            <SkeletonElement isLoading={isLoading} width={60} containerClassName="text-2xl">
              <Avatar label={selectedToken?.name} fontSize="2xl" gap="1" size="sm" />
            </SkeletonElement>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <SkeletonElement isLoading={isLoading} circle width={24} height={24} />
            <SkeletonElement isLoading={isLoading} width={80} containerClassName="text-2xl">
              <Avatar label={selectedMarket?.description} fontSize="2xl" gap="1" size="sm" />
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
          {/* select - asset */}
          <article className="flex flex-col pr-6 mr-6 border-r">
            {/* default */}
            {tokens?.map((token) => (
              <button
                key={token.address}
                className={`flex items-center gap-2 px-4 py-2 ${
                  token.address === selectedToken?.address && 'text-white bg-black rounded-lg' // the token selected
                }`}
                onClick={() => {
                  onTokenClick?.(token);
                }}
                title={token.name}
              >
                <Avatar label={token.name} fontSize="lg" gap="2" size="sm" />
                {token.address === selectedToken?.address && <ChevronRightIcon className="w-4" />}
              </button>
            ))}
          </article>

          {/* select - market */}
          <article className="flex flex-col flex-auto">
            {/* default */}
            {markets?.map((market, marketIndex) => (
              <button
                key={market.address}
                className={`flex items-center justify-between gap-4 px-4 py-2 ${
                  market.address === selectedMarket?.address && 'text-white bg-black rounded-lg' // the market selected
                }`}
                onClick={() => onMarketClick?.(market)}
              >
                <Avatar label={market.description} fontSize="lg" gap="2" size="sm" />
                <p>{'$' + formatDecimals(market.oracleValue.price, 18, 2)}</p>
              </button>
            ))}
          </article>
        </section>
      </Popover.Panel>
    </>
  );
};

export const PopoverGroupLegacy = () => {
  return (
    <Popover.Group className="relative gap-2 pt-4 border-t">
      <Popover className="inner-popover">
        <Popover.Button className="w-[128px] px-4 py-2 inner-popover-button">
          <Avatar label="USDC" fontSize="lg" />
        </Popover.Button>
        <Popover.Panel className="inner-popover-panel">
          <div className="inner-popover-item">
            <Popover.Button>
              <Avatar label="USDC" fontSize="lg" size="sm" />
            </Popover.Button>
            <p>$1,542.07</p>
          </div>
          <div className="inner-popover-item">
            <Popover.Button>
              <Avatar label="ETH/USD" fontSize="lg" size="sm" />
            </Popover.Button>
            <p>$1,542.07</p>
          </div>
          <div className="inner-popover-item">
            <Popover.Button>
              <Avatar label="ETH/USD" fontSize="lg" size="sm" />
            </Popover.Button>
            <p>$1,542.07</p>
          </div>
        </Popover.Panel>
      </Popover>

      <Popover className="inner-popover">
        <Popover.Button className="w-[128px] px-4 py-2 inner-popover-button">
          <Avatar label="USDT" fontSize="lg" size="sm" />
        </Popover.Button>
        <Popover.Panel className="inner-popover-panel">
          <div className="inner-popover-item">
            <Popover.Button>
              <Avatar label="ETH/USD" fontSize="lg" size="sm" />
            </Popover.Button>
            <p>$1,542.07</p>
          </div>
        </Popover.Panel>
      </Popover>
    </Popover.Group>
  );
};
