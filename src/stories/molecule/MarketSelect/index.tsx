import { Popover } from '@headlessui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { OracleVersion } from '~/typings/oracleVersion';
import { compareOracles } from '~/utils/price';
import { Market, Token } from '../../../typings/market';
import { formatDecimals } from '../../../utils/number';
import { Avatar } from '../../atom/Avatar';
import { SkeletonElement } from '../../atom/SkeletonElement';
import { PopoverItem } from '../PopoverItem';
import './style.css';

interface MarketSelectProps {
  tokens?: Token[];
  markets?: Market[];
  selectedToken?: Token;
  selectedMarket?: Market;
  previousMarketOracle?: OracleVersion;
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
  const { selectedMarket, feeRate = BigInt(0), previousMarketOracle, isLoading } = props;
  const oracleDecimals = 18;
  const priceClass = compareOracles(previousMarketOracle, selectedMarket?.oracleValue);

  // TODO
  // Check converting fee rate to string
  return (
    <>
      <div className="relative MarketSelect">
        <Popover>{<PopoverMain {...props} />}</Popover>
        <div className="flex items-center gap-5 mr-10">
          <h2 className={`text-3xl ${priceClass}`}>
            <SkeletonElement isLoading={isLoading} width={80}>
              {`$${formatDecimals(
                selectedMarket?.oracleValue?.price || 0,
                oracleDecimals,
                2,
                true
              )}`}
            </SkeletonElement>
          </h2>
          <div className="flex flex-col gap-1 pl-5 text-left border-l text-primary-light">
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
                  token.address === selectedToken?.address && 'text-inverted bg-primary rounded-lg' // the token selected
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
              <PopoverItem
                market={market}
                selectedMarket={selectedMarket}
                onMarketClick={() => onMarketClick?.(market)}
              />
            ))}
          </article>
        </section>
      </Popover.Panel>
    </>
  );
};
