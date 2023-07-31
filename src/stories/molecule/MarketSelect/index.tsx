import { Popover } from '@headlessui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { Market, Token } from '../../../typings/market';
import { formatDecimals } from '../../../utils/number';
import { Avatar } from '../../atom/Avatar';
import { SkeletonElement } from '../../atom/SkeletonElement';
import './style.css';

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
  const { selectedMarket, feeRate = BigInt(0), isLoading } = props;
  const oracleDecimals = 18;

  // TODO
  // 연이율(feeRate)을 문자열로 변환하는 과정이 올바른지 확인이 필요합니다.
  // 현재는 연이율을 1년에 해당하는 시간 값으로 나눗셈
  return (
    <>
      <div className="relative bg-white shadow-lg MarketSelect">
        <Popover>{<PopoverMain {...props} />}</Popover>
        <div className="flex items-center gap-5 mr-10">
          <h2 className="text-3xl">
            <SkeletonElement isLoading={isLoading} width={80}>
              {`$${formatDecimals(
                selectedMarket?.oracleValue?.price || 0,
                oracleDecimals,
                2,
                true
              )}`}
            </SkeletonElement>
          </h2>
          <div className="flex flex-col gap-1 pl-5 text-left border-l text-black/50">
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
        </div>
      </div>
    </>
  );
};

export const PopoverMain = (props: Omit<MarketSelectProps, 'isGroupLegacy'>) => {
  const { tokens, selectedToken, markets, selectedMarket, isLoading, onTokenClick, onMarketClick } =
    props;
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
            {markets?.map((market) => (
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
