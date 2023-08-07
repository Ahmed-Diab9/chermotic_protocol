import { Popover, Tab } from '@headlessui/react';
import { isNil } from 'ramda';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import 'react-loading-skeleton/dist/skeleton.css';
import { parseUnits } from 'viem';
import CheckIcon from '~/assets/icons/CheckIcon';
import { ORACLE_PROVIDER_DECIMALS, PERCENT_DECIMALS, PNL_RATE_DECIMALS } from '~/configs/decimals';
import { useClaimPosition } from '~/hooks/useClaimPosition';
import { useClosePosition } from '~/hooks/useClosePosition';
import { useLastOracle } from '~/hooks/useLastOracle';
import { Avatar } from '~/stories/atom/Avatar';
import { Guide } from '~/stories/atom/Guide';
import { Loading } from '~/stories/atom/Loading';
import { PopoverArrow } from '~/stories/atom/PopoverArrow';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Tag } from '~/stories/atom/Tag';
import { TextRow } from '~/stories/atom/TextRow';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { TRADE_EVENT } from '~/typings/events';
import { Market, Token } from '~/typings/market';
import { OracleVersion } from '~/typings/oracleVersion';
import { CLOSED, CLOSING, OPENED, OPENING, Position } from '~/typings/position';
import { abs, divPreserved, formatDecimals, withComma } from '~/utils/number';
import { isValid } from '~/utils/valid';
import { Button } from '../../atom/Button';
import '../../atom/Tabs/style.css';

interface TradeBarProps {
  token?: Token;
  market?: Market;
  markets?: Market[];
  positions?: Position[];
  oracleVersions?: Record<string, OracleVersion>;
  isLoading?: boolean;
}

function priceTo(position: Position, type: 'toProfit' | 'toLoss') {
  const value = formatDecimals(position[type], ORACLE_PROVIDER_DECIMALS - 2, 2);
  const hasProfit = type === 'toProfit' ? position.qty > 0n : position.qty <= 0n;
  if (hasProfit) {
    return `(+${withComma(value)}%)`;
  } else {
    return `(${withComma(value)}%)`;
  }
}

export const TradeBar = ({
  token,
  market,
  markets,
  positions,
  oracleVersions,
  isLoading,
}: TradeBarProps) => {
  const lapsed = useLastOracle();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [hasGuide, setHasGuide] = useState(false);

  useEffect(() => {
    function onTrade() {
      if (isValid(openButtonRef.current) && isNil(ref.current)) {
        setHasGuide(true);
        openButtonRef.current.click();
      }
    }
    window.addEventListener(TRADE_EVENT, onTrade);
    return () => {
      window.removeEventListener(TRADE_EVENT, onTrade);
    };
  }, []);

  return (
    <Popover className="fixed bottom-0 w-full TradeBar">
      {({ open }) => (
        <>
          {open ? (
            <>
              {/* backdrop */}
              <Popover.Overlay className="fixed inset-0 backdrop bg-white2" />
              <div className="relative popover-panel" ref={ref}>
                <Popover.Button className="absolute right-10 top-[-16px]">
                  {/* <Button iconOnly={<ChevronDoubleUpIcon />} className="transform rotate-180" /> */}
                  <div className="absolute right-0 top-[-16px]">
                    <PopoverArrow direction="bottom" position="top" />
                  </div>
                </Popover.Button>
                <Popover.Panel>
                  <div className="w-full bg-white border-t tabs tabs-line tabs-base tabs-left min-h-[50vh] max-h-[90vh]">
                    <Tab.Group>
                      <div className="flex items-center px-10">
                        <Tab.List className="pt-4 text-lg">
                          <Tab className="min-w-[140px]">Position</Tab>
                        </Tab.List>
                        <div className="flex items-center gap-5 mt-4 ml-auto">
                          {lapsed && (
                            <p className="pr-5 text-sm border-r text-black3">
                              Last Oracle Update: {lapsed.hours}h {lapsed.minutes}m {lapsed.seconds}
                              s ago
                            </p>
                          )}
                          {/* todo: Current Price */}
                          <p className="text-sm text-black3">
                            Current Price:
                            <SkeletonElement
                              isLoading={isLoading}
                              width={80}
                              className="ml-2 text-lg"
                            >
                              {isValid(oracleVersions) && isValid(market) && (
                                <span className="ml-2 text-lg text-black1">
                                  ${' '}
                                  {formatDecimals(
                                    oracleVersions[market.address].price,
                                    18,
                                    2,
                                    true
                                  )}
                                </span>
                              )}{' '}
                            </SkeletonElement>
                          </p>
                        </div>
                      </div>
                      <Tab.Panels className="overflow-auto mt-7 max-h-[50vh]">
                        <Tab.Panel className="px-10 pb-10 min-w-[1080px]">
                          <article>
                            {/* guide next round */}
                            {hasGuide && (
                              <div className="mb-3">
                                <Guide
                                  title="Next Oracle Round"
                                  // paragraph 내 퍼센트 값은 마켓마다 다르게 불러오는 값입니다.
                                  paragraph="Waiting for the next oracle round. The next oracle round is updated
        whenever the Chainlink price moves by
        0.00% or more, and it is updated at least once a day."
                                  outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                                  outLinkAbout="Next Oracle Round"
                                  flex
                                />
                              </div>
                            )}
                            {/* position list */}
                            <div className="flex flex-col gap-3">
                              {/* 리스트 한개 단위: 리스트 + entry time */}
                              {positions?.length === 0 ? (
                                <p className="mt-10 text-center text-light2">
                                  You have no position yet.
                                </p>
                              ) : (
                                <div>
                                  {positions?.map((position) => {
                                    return (
                                      <PositionItem
                                        key={position.id.toString()}
                                        position={position}
                                        isLoading={isLoading}
                                        token={token}
                                        markets={markets}
                                      />
                                    );
                                  })}
                                </div>
                              )}
                              <div>
                                <TooltipGuide
                                  tipOnly
                                  label="opening-in-progress"
                                  // todo: tip 내 퍼센트값 불러오기
                                  tip="Waiting for the next oracle round to open the position. The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and it is updated at least once a day."
                                  outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                                  outLinkAbout="Next Oracle Round"
                                />
                                <TooltipGuide
                                  tipOnly
                                  label="opening-completed"
                                  tip="The opening process has been completed. Now the position is in live status."
                                  outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                                  outLinkAbout="Next Oracle Round"
                                />
                                <TooltipGuide
                                  tipOnly
                                  label="closing-in-progress"
                                  // todo: tip 내 퍼센트값 불러오기
                                  tip="Waiting for the next oracle round to close the position. The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and it is updated at least once a day."
                                  outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                                  outLinkAbout="Next Oracle Round"
                                />
                                <TooltipGuide
                                  tipOnly
                                  label="closing-completed"
                                  tip="The closing process has been completed. You can claim the assets and transfer them to your account."
                                  outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                                  outLinkAbout="Next Oracle Round"
                                />
                              </div>
                            </div>
                          </article>
                        </Tab.Panel>
                      </Tab.Panels>
                    </Tab.Group>
                  </div>
                </Popover.Panel>
              </div>
            </>
          ) : (
            <>
              <Popover.Button
                className="w-full px-[60px] py-5 bg-white border-t tabs tabs-line tabs-base tabs-left"
                ref={openButtonRef}
              >
                <h4 className="min-w-[140px] text-black1">
                  Position
                  {/* TODO: position 갯수 보여주기 (갯수 세는 기준은 확인중) */}
                  {/* (2) */}
                </h4>
                {/* <Button
                  iconOnly={<ChevronDoubleUpIcon />}
                  className="absolute right-10 top-[-16px]"
                /> */}
                <div className="absolute right-10 top-[-32px]">
                  <PopoverArrow direction="top" position="top" />
                </div>
              </Popover.Button>
            </>
          )}
        </>
      )}
    </Popover>
  );
};

interface Props {
  position: Position;
  isLoading?: boolean;
  token?: Token;
  markets?: Market[];
}

const PositionItem = function (props: Props) {
  const { position, isLoading, token, markets } = props;
  /**
   * FIXME
   * Oracle Decimals을 확인해야 함
   */
  const calculated = useMemo(() => {
    if (isNil(position) || isNil(token)) {
      return {
        qty: '-',
        collateral: '-',
        stopLoss: '-',
        takeProfit: '-',
        profitPriceTo: '-',
        lossPriceTo: '-',
        pnl: '-',
        lossPrice: '-',
        profitPrice: '-',
        entryPrice: '-',
        entryTime: '-',
        pnlAmount: '-',
      };
    }
    const { collateral, qty, makerMargin, takerMargin } = position;
    const stopLoss =
      formatDecimals((collateral * 10n ** BigInt(token.decimals)) / qty, token.decimals - 2, 2) +
      '%';
    const takeProfitRaw =
      abs(qty) === 0n
        ? 0n
        : (makerMargin * parseUnits('1', token.decimals) * 100n * 10000n) /
          parseUnits(String(abs(qty)), token.decimals);
    const takeProfit = formatDecimals(takeProfitRaw, 4, 2) + '%';
    const currentOracleVersion = markets?.find(
      (market) => market.address === position.marketAddress
    )?.oracleValue;
    if (
      isNil(currentOracleVersion) ||
      isNil(currentOracleVersion.version) ||
      currentOracleVersion.version <= position.openVersion
    ) {
      return {
        qty: formatDecimals(abs(qty), token.decimals, 2, true),
        collateral: formatDecimals(collateral, token.decimals, 2, true),
        stopLoss,
        takeProfit,
        profitPriceTo: '-',
        lossPriceTo: '-',
        pnl: '-',
        lossPrice: '-',
        profitPrice: '-',
        entryPrice: '-',
        entryTime: '-',
        pnlAmount: '-',
      };
    }
    const pnlPercentage = divPreserved(
      position.pnl,
      takerMargin,
      PNL_RATE_DECIMALS + PERCENT_DECIMALS
    );
    return {
      qty: formatDecimals(abs(qty), token.decimals, 2, true),
      collateral: formatDecimals(collateral, token.decimals, 2, true),
      takeProfit: withComma(takeProfit),
      stopLoss: withComma(stopLoss),
      profitPriceTo: priceTo(position, 'toProfit'),
      lossPriceTo: priceTo(position, 'toLoss'),
      pnlPercentage: `${pnlPercentage > 0n ? '+' : ''}${formatDecimals(
        pnlPercentage,
        PNL_RATE_DECIMALS,
        2,
        true
      )}%`,
      pnlAmount: formatDecimals(position.pnl, token.decimals, 2, true) + ' ' + token.name,
      profitPrice: formatDecimals(abs(position.profitPrice), ORACLE_PROVIDER_DECIMALS, 2, true),
      lossPrice: formatDecimals(abs(position.lossPrice), ORACLE_PROVIDER_DECIMALS, 2, true),
      entryPrice: '$ ' + formatDecimals(position.openPrice, ORACLE_PROVIDER_DECIMALS, 2, true),
      entryTime: new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(Number(position.openTimestamp) * 1000)),
    };
  }, [position, token, markets]);

  const direction = useCallback((position: Position) => {
    return position.qty > 0n ? 'Long' : 'Short';
  }, []);

  const { onClosePosition } = useClosePosition({
    positionId: position.id,
    marketAddress: position.marketAddress,
  });
  const { onClaimPosition } = useClaimPosition({
    positionId: position.id,
    market: markets?.find((market) => market.address === position.marketAddress),
  });

  return (
    <div key={position.id.toString()} className="mb-3 border rounded-xl">
      <div className="flex items-center gap-6 px-5 py-3 border-b bg-lightBg1">
        <div
          className={`flex flex-auto items-center gap-6 ${
            position.status === OPENING ? 'opacity-30' : ''
          }`}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <SkeletonElement isLoading={isLoading} circle width={16} height={16} />
              <SkeletonElement isLoading={isLoading} width={40}>
                <Avatar label={token?.name} size="xs" gap="1" fontSize="base" fontWeight="bold" />
              </SkeletonElement>
            </div>
            <div className="flex items-center gap-1">
              <SkeletonElement isLoading={isLoading} circle width={16} height={16} />
              <SkeletonElement isLoading={isLoading} width={40}>
                <Avatar
                  label={
                    markets?.find((market) => market.address === position.marketAddress)
                      ?.description
                  }
                  size="xs"
                  gap="1"
                  fontSize="base"
                  fontWeight="bold"
                />{' '}
              </SkeletonElement>
            </div>
            <SkeletonElement isLoading={isLoading} width={40}>
              <Tag label={direction(position)} />
            </SkeletonElement>
          </div>
          <div className="flex items-center gap-8 pl-6 border-l">
            <p className="text-black2">Entry Price</p>
            <SkeletonElement isLoading={isLoading} width={60}>
              {calculated.entryPrice}
            </SkeletonElement>
          </div>
          <div className="flex items-center gap-8 pl-6 border-l">
            <p className="text-black2">Entry Time</p>
            <SkeletonElement isLoading={isLoading} width={60}>
              {calculated.entryTime}
            </SkeletonElement>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {/* 상태에 따라 내용 변동 */}
          {position.status === OPENING && (
            <>
              <Loading size="sm" />
              <div className="flex text-black1">
                {/* Opening in progress */}
                Waiting for the next oracle round
                <TooltipGuide iconOnly label="opening-in-progress" />
              </div>
            </>
          )}
          {position.status === OPENED && (
            <>
              <CheckIcon className="w-4" />
              <div className="flex text-black1">
                Opening completed
                <TooltipGuide iconOnly label="opening-completed" />
              </div>
            </>
          )}
          {position.status === CLOSING && (
            <>
              <Loading size="sm" />
              <div className="flex text-black1">
                Closing in progress
                <TooltipGuide iconOnly label="closing-in-progress" />
              </div>
            </>
          )}
          {position.status === CLOSED && (
            <>
              <CheckIcon className="w-4" />
              <div className="flex text-black1">
                Closing completed
                <TooltipGuide iconOnly label="closing-completed" />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-stretch justify-between gap-6 px-5 py-4">
        <div
          className={`flex flex-auto items-stretch justify-between gap-6 ${
            position.status === OPENING ? 'opacity-30' : ''
          }`}
        >
          <div className="grow min-w-[12%] flex flex-col gap-2">
            <TextRow
              label="Contract Qty"
              labelClass="text-black2"
              value={calculated.qty}
              isLoading={isLoading}
            />
            <TextRow
              label="Collateral"
              labelClass="text-black2"
              value={calculated.collateral}
              isLoading={isLoading}
            />
          </div>
          <div className="grow min-w-[20%] flex flex-col gap-2 pl-6 border-l">
            <TextRow
              label="Take Profit"
              labelClass="text-black2"
              value={calculated.takeProfit}
              isLoading={isLoading}
            />
            <TextRow
              label="TP Price"
              labelClass="text-black2"
              value={calculated.profitPrice}
              subValueLeft={calculated.profitPriceTo}
              isLoading={isLoading}
            />
          </div>
          <div className="grow min-w-[20%] flex flex-col gap-2 pl-6 border-l">
            <TextRow
              label="Stop Loss"
              labelClass="text-black2"
              value={calculated.stopLoss}
              isLoading={isLoading}
            />
            <TextRow
              label="SL Price"
              labelClass="text-black2"
              value={calculated.lossPrice}
              subValueLeft={calculated.lossPriceTo}
              isLoading={isLoading}
            />
          </div>
          <div className="grow min-w-[8%] flex flex-col gap-2 pl-6 border-l">
            <TextRow
              label="PnL"
              labelClass="text-black2"
              value={calculated.pnlPercentage}
              isLoading={isLoading}
            />
            {/* todo: add PnL price (has no label, value only) */}
            <TextRow value={calculated.pnlAmount} isLoading={isLoading} />
          </div>
        </div>
        <div className="w-[10%] min-w-[140px] flex flex-col items-center justify-center gap-2 pl-6 border-l">
          {/* 상태에 따라 버튼 css prop, label 다르게 들어감 */}
          {/* Close / Claim USDC */}
          {(position.status === OPENED || position.status === OPENING) && (
            <Button
              label="Close"
              size="sm"
              onClick={() => {
                onClosePosition();
              }}
            />
          )}
          {position.status === CLOSED && (
            <Button
              label="Claim"
              css="active"
              size="sm"
              onClick={() => {
                onClaimPosition();
              }}
            />
          )}
          {position.status === CLOSING && (
            <Button label="Claim" size="sm" disabled={true} css="gray" />
          )}
        </div>
      </div>
    </div>
  );
};
