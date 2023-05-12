import { Popover } from "@headlessui/react";
import { Avatar } from "../../atom/Avatar";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import "./style.css";
import { Market, Token } from "../../../typings/market";
import { withComma } from "../../../utils/number";

interface MarketSelectProps {
  tokens?: Token[];
  markets?: Market[];
  selectedToken?: Token;
  selectedMarket?: Market;
  isGroupLegacy?: boolean;
  onTokenClick?: (token: string) => unknown;
  onMarketClick?: (market: string) => unknown;
}

/**
 * FIXME
 * should remove the component `Legacy`.
 */
export const MarketSelect = ({ ...props }: MarketSelectProps) => {
  const { isGroupLegacy, selectedMarket } = props;

  return (
    <div className="MarketSelect">
      <Popover>
        {!isGroupLegacy ? <PopoverMain {...props} /> : <PopoverGroupLegacy />}
      </Popover>
      <div className="flex items-center gap-4 mr-10">
        <div className="flex flex-col gap-1 pr-5 text-xs text-right border-r">
          <h4>0.0036%/h</h4>
          <p>Interest Rate</p>
        </div>
        <h2 className="text-2xl">
          ${withComma(selectedMarket?.price.toString())}
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

  return (
    <>
      <Popover.Button className="flex items-center gap-3 ml-10">
        <div className="flex items-center gap-1 pr-3 border-r">
          <Avatar size="base" />
          <h4>{selectedToken?.name}</h4>
        </div>
        <div className="flex items-center gap-1">
          <Avatar size="base" />
          <h4>{selectedMarket?.description}</h4>
        </div>
        <ChevronDownIcon
          className="w-5 h-5 transition duration-150 ease-in-out"
          aria-hidden="true"
        />
      </Popover.Button>
      <Popover.Panel className="popover-panel">
        <section className="flex w-full gap-12 pt-4 border-t">
          {/* select - asset */}
          <article className="flex flex-col">
            {/* default */}
            {tokens?.map((token) => (
              <button
                key={token.address}
                className={`flex items-center gap-2 px-4 py-2 ${
                  token.address === selectedToken?.address &&
                  "text-white bg-black" // the token selected
                }`}
                onClick={() => {
                  onTokenClick?.(token.address);
                }}
              >
                <Avatar size="base" />
                <h4>{token.name}</h4>
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
                  market.address === selectedMarket?.address &&
                  "text-white bg-black" // the market selected
                }`}
                onClick={() => onMarketClick?.(market.address)}
              >
                <div className="flex gap-2">
                  <Avatar size="base" />
                  <h4>{market.description}</h4>
                </div>
                <p>${withComma(market.price.toString())}</p>
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
        <Popover.Button className="flex gap-2 w-[128px] px-4 py-2 inner-popover-button">
          <Avatar size="xs" />
          <h4>USDC</h4>
        </Popover.Button>
        <Popover.Panel className="inner-popover-panel">
          <div className="inner-popover-item">
            <Popover.Button className="flex gap-2">
              <Avatar size="xs" />
              <h4>USDC</h4>
            </Popover.Button>
            <p>$1,542.07</p>
          </div>
          <div className="inner-popover-item">
            <Popover.Button className="flex gap-2">
              <Avatar size="xs" />
              <h4>ETH/USD</h4>
            </Popover.Button>
            <p>$1,542.07</p>
          </div>
          <div className="inner-popover-item">
            <Popover.Button className="flex gap-2">
              <Avatar size="xs" />
              <h4>ETH/USD</h4>
            </Popover.Button>
            <p>$1,542.07</p>
          </div>
        </Popover.Panel>
      </Popover>

      <Popover className="inner-popover">
        <Popover.Button className="flex gap-2 w-[128px] px-4 py-2 inner-popover-button">
          <Avatar size="xs" />
          <h4>USDT</h4>
        </Popover.Button>
        <Popover.Panel className="inner-popover-panel">
          <div className="inner-popover-item">
            <Popover.Button className="flex gap-2">
              <Avatar size="xs" />
              <h4>ETH/USD</h4>
            </Popover.Button>
            <p>$1,542.07</p>
          </div>
        </Popover.Panel>
      </Popover>
    </Popover.Group>
  );
};
