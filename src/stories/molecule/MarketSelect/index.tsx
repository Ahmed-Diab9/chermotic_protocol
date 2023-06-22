import { Popover } from "@headlessui/react";
import { Avatar } from "../../atom/Avatar";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import "./style.css";
import { Market, Token } from "../../../typings/market";
import {
  expandDecimals,
  formatDecimals,
  withComma,
} from "../../../utils/number";
import { useCallback, useEffect, useState } from "react";
import { filterIfFulfilled } from "~/utils/array";
import { BigNumber } from "ethers";
import { isValid } from "~/utils/valid";

interface MarketSelectProps {
  tokens?: Token[];
  markets?: Market[];
  selectedToken?: Token;
  selectedMarket?: Market;
  feeRate?: BigNumber;
  isGroupLegacy?: boolean;
  onTokenClick?: (token: Token) => unknown;
  onMarketClick?: (market: Market) => unknown;
}

/**
 * FIXME
 * should remove the component `Legacy`.
 */
export const MarketSelect = ({ ...props }: MarketSelectProps) => {
  const { isGroupLegacy, selectedMarket, feeRate, selectedToken } = props;

  // TODO
  // 연이율(feeRate)을 문자열로 변환하는 과정이 올바른지 확인이 필요합니다.
  // 현재는 연이율을 1년에 해당하는 시간 값으로 나눗셈
  return (
    <div className="MarketSelect">
      <Popover>
        {!isGroupLegacy ? <PopoverMain {...props} /> : <PopoverGroupLegacy />}
      </Popover>
      <div className="flex items-center gap-4 mr-10">
        <div className="flex flex-col gap-1 pr-5 text-right border-r text-black/50">
          <h4>
            {formatDecimals(
              feeRate?.mul(expandDecimals(2)).div(365 * 24) ?? 0,
              4,
              4
            )}
            %/h
          </h4>
          <p>Interest Rate</p>
        </div>
        <h2 className="text-2xl">
          {"$" +
            withComma(
              formatDecimals(
                selectedMarket?.value?.price || 0,
                selectedToken?.decimals,
                2
              )
            )}
        </h2>
      </div>
    </div>
  );
};

export const PopoverMain = (
  props: Omit<MarketSelectProps, "isGroupLegacy">
) => {
  const {
    tokens,
    selectedToken,
    markets,
    selectedMarket,
    onTokenClick,
    onMarketClick,
  } = props;
  const [marketPrices, setMarketPrices] = useState<string[]>([]);
  const fetchPrices = useCallback(async () => {
    if (!isValid(markets)) {
      return;
    }
    const promise = markets.map(async (market) => {
      const price = market.value;
      return (
        "$" +
        withComma(
          formatDecimals(market.value.price, selectedToken?.decimals, 2)
        )
      );
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
          <Avatar label={selectedToken?.name} fontSize="lg" gap="1" size="sm" />
        </div>
        <div>
          <Avatar
            label={selectedMarket?.description}
            fontSize="lg"
            gap="1"
            size="sm"
          />
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
                  token.address === selectedToken?.address &&
                  "text-white bg-black rounded-lg" // the token selected
                }`}
                onClick={() => {
                  onTokenClick?.(token);
                }}
                title={token.name}
              >
                <Avatar label={token.name} fontSize="lg" gap="2" size="sm" />
                {token.address === selectedToken?.address && (
                  <ChevronRightIcon className="w-4" />
                )}
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
                  market.address === selectedMarket?.address &&
                  "text-white bg-black rounded-lg" // the market selected
                }`}
                onClick={() => onMarketClick?.(market)}
              >
                <Avatar
                  label={market.description}
                  fontSize="lg"
                  gap="2"
                  size="sm"
                />
                <p>
                  {"$" +
                    formatDecimals(
                      market.value.price,
                      selectedToken?.decimals,
                      2
                    )}
                </p>
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
