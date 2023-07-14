import { Listbox, Popover, Tab } from '@headlessui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import CheckIcon from '~/assets/icons/CheckIcon';
import { Avatar } from '~/stories/atom/Avatar';
import { Guide } from '~/stories/atom/Guide';
import { Loading } from '~/stories/atom/Loading';
import { PopoverButton } from '~/stories/atom/PopoverButton';
import { Tag } from '~/stories/atom/Tag';
import { TextRow } from '~/stories/atom/TextRow';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { Button } from '../../atom/Button';
import '../../atom/Tabs/style.css';
import { isNil } from 'ramda';
import { useClaimPosition } from '~/hooks/useClaimPosition';
import { useClosePosition } from '~/hooks/useClosePosition';
import { TRADE_EVENT } from '~/typings/events';
import { Market, Token } from '~/typings/market';
import { OracleVersion } from '~/typings/oracleVersion';
import { CLOSED, CLOSING, OPENED, OPENING, Position, PositionOption } from '~/typings/position';
import { isValid } from '~/utils/valid';
import { abs, expandDecimals, formatDecimals, withComma } from '~/utils/number';
import { ORACLE_PROVIDER_DECIMALS } from '~/configs/decimals';

interface TradeBarProps {
  token?: Token;
  markets?: Market[];
  positions?: Position[];
  oracleVersions?: Record<string, OracleVersion>;
  isLoading?: boolean;
}

function priceTo(position: Position, type: 'toProfit' | 'toLoss') {
  const value = formatDecimals(position[type], ORACLE_PROVIDER_DECIMALS - 2, 2);
  const hasProfit = type === 'toProfit' ? position.qty > 0n : position.qty <= 0n;
  if (hasProfit) {
    return `+${withComma(value)}%`;
  } else {
    return `${withComma(value)}%`;
  }
}

export const TradeBar = ({
  token,
  markets,
  positions,
  oracleVersions,
  isLoading,
}: TradeBarProps) => {
  // const previousPositions = usePrevious(positions, true);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const [hasGuide, setHasGuide] = useState(false);
  const filterOptions = useMemo<PositionOption[]>(() => {
    if (isNil(token) || isNil(markets)) {
      /**
       * FIXME
       * Option when token or markets are undefined
       */
      return [
        {
          id: 'all',
          title: 'All positions',
        },
      ];
    }
    return [
      { id: 'all', title: `Positions in all ${token.name} markets` },
      ...markets.map((market) => ({
        id: market.description,
        address: market.address,
        title: `Positions only in ${market.description} market`,
      })),
    ];
  }, [token, markets]);
  const [selectedOption, setSelectedOption] = useState<PositionOption>(filterOptions[0]);
  useEffect(() => {
    setSelectedOption(filterOptions[0]);
  }, [filterOptions]);
  const filteredPositions = useMemo(() => {
    if (isNil(positions)) {
      return [];
    }
    if (selectedOption.id === 'all') {
      return positions;
    }
    return positions?.filter((position) => position.marketAddress === selectedOption.marketAddress);
  }, [positions, selectedOption]);

  // const currentOracleVersion = useMemo(()=>{
  //   oracleVersions[]
  // })

  useEffect(() => {
    function onTrade() {
      console.log('on trade event');
      if (isValid(openButtonRef.current)) {
        setHasGuide(true);
        openButtonRef.current.click();
      } else {
        console.log('ERROR CLICKING');
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
              <Popover.Overlay className="fixed inset-0 backdrop bg-white/80" />
              <div className="relative popover-panel">
                <Popover.Button className="absolute right-10 top-[-16px]">
                  {/* <Button iconOnly={<ChevronDoubleUpIcon />} className="transform rotate-180" /> */}
                  <div className="absolute right-0 top-[-16px]">
                    <PopoverButton direction="bottom" position="top" />
                  </div>
                </Popover.Button>
                <Popover.Panel>
                  <div className="w-full px-10 bg-white border-t tabs tabs-line tabs-base tabs-left min-h-[50vh] max-h-[90vh]">
                    <Tab.Group>
                      <div className="flex items-end">
                        <Tab.List className="pt-4 text-lg">
                          <Tab className="min-w-[140px]">Position</Tab>
                        </Tab.List>
                        <div className="flex items-center gap-5 ml-auto mb-[-8px]">
                          <p className="text-sm text-black/30">
                            Last oracle update: 00h 00m 00s ago
                          </p>
                          <div className="select min-w-[298px]">
                            <Listbox value={selectedOption} onChange={setSelectedOption}>
                              <Listbox.Button>{selectedOption.title}</Listbox.Button>
                              <Listbox.Options>
                                {filterOptions.map((option) => (
                                  <Listbox.Option key={option.id} value={option}>
                                    {option.title}
                                  </Listbox.Option>
                                ))}
                              </Listbox.Options>
                            </Listbox>
                          </div>
                        </div>
                      </div>
                      <Tab.Panels className="pb-16 overflow-auto mx-[-20px] mt-7 max-h-[50vh]">
                        <Tab.Panel className="px-5">
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
                                <p className="mt-10 text-center text-gray">
                                  You have no position yet.
                                </p>
                              ) : (
                                <div>
                                  {filteredPositions.map((position) => {
                                    return (
                                      <PositionItem
                                        position={position}
                                        isLoading={isLoading}
                                        token={token}
                                        markets={markets}
                                        oracleVersions={oracleVersions}
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
                <h4 className="min-w-[140px] text-black">
                  Position
                  {/* TODO: position 갯수 보여주기 (갯수 세는 기준은 확인중) */}
                  {/* (2) */}
                </h4>
                {/* <Button
                  iconOnly={<ChevronDoubleUpIcon />}
                  className="absolute right-10 top-[-16px]"
                /> */}
                <div className="absolute right-10 top-[-32px]">
                  <PopoverButton direction="top" position="top" />
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
  oracleVersions?: Record<string, OracleVersion>;
}

const PositionItem = function (props: Props) {
  const { position, isLoading, token, markets, oracleVersions } = props;
  /**
   * FIXME
   * Oracle Decimals을 확인해야 함
   */
  const calculated = useMemo(() => {
    if (isNil(position) || isNil(token) || isNil(oracleVersions)) {
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
      };
    }
    const { collateral, qty, leverage, makerMargin } = position;
    const stopLoss = (10000 / leverage).toFixed(2) + '%';
    const takeProfitRaw =
      abs(qty) === 0n
        ? 0n
        : (makerMargin * expandDecimals(4) * 100n * 10000n) /
          (abs(qty) * expandDecimals(token.decimals));
    const takeProfit = formatDecimals(takeProfitRaw, 4, 2) + '%';
    const currentOracleVersion = oracleVersions[position.marketAddress];
    if (
      isNil(currentOracleVersion) ||
      isNil(currentOracleVersion.version) ||
      currentOracleVersion.version <= position.openVersion
    ) {
      return {
        qty: withComma(formatDecimals(abs(qty), 4, 2)),
        collateral: withComma(formatDecimals(collateral, token.decimals, 2)),
        stopLoss,
        takeProfit,
        profitPriceTo: '-',
        lossPriceTo: '-',
        pnl: '-',
        lossPrice: '-',
        profitPrice: '-',
        entryPrice: '-',
        entryTime: '-',
      };
    }
    const pnl =
      (BigInt(position.pnl) * expandDecimals(token.decimals) * expandDecimals(2)) / collateral;
    return {
      qty: withComma(formatDecimals(abs(qty), 4, 2)),
      collateral: withComma(formatDecimals(collateral, token.decimals, 2)),
      takeProfit: withComma(takeProfit),
      stopLoss: withComma(stopLoss),
      profitPriceTo: priceTo(position, 'toProfit'),
      lossPriceTo: priceTo(position, 'toLoss'),
      pnl: `${pnl > 0n ? '+' : ''}${withComma(formatDecimals(pnl, 4 + 2, 4))}%`,
      profitPrice: withComma(
        formatDecimals(abs(position.profitPrice), ORACLE_PROVIDER_DECIMALS, 2)
      ),
      lossPrice: withComma(formatDecimals(abs(position.lossPrice), ORACLE_PROVIDER_DECIMALS, 2)),
      entryPrice: withComma(formatDecimals(position.openPrice, ORACLE_PROVIDER_DECIMALS, 2)),
      entryTime: new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(Number(position.openTimestamp) * 1000)),
    };
  }, [position, token, oracleVersions]);

  const direction = useCallback((position: Position) => {
    return position.qty > 0n ? 'Long' : 'Short';
  }, []);

  const { onClosePosition } = useClosePosition({
    positionId: position.id,
    marketAddress: position.marketAddress,
  });
  const { onClaimPosition } = useClaimPosition({
    positionId: position.id,
    marketAddress: position.marketAddress,
  });

  return (
    <div key={position.id.toString()} className="mb-3 border rounded-xl">
      <div className="flex items-center gap-6 px-5 py-3 border-b bg-grayL/20">
        <div
          className={`flex flex-auto items-center gap-6 ${
            position.status === OPENING ? 'opacity-30' : ''
          }`}
        >
          <div className="flex items-center gap-6">
            {isLoading ? (
              <div className="flex items-center gap-1">
                <Skeleton circle containerClassName="avatar-skeleton w-[16px] text-[16px]" />
                <Skeleton width={40} />
              </div>
            ) : (
              <>
                <Avatar label={token?.name} size="xs" gap="1" fontSize="base" fontWeight="bold" />
              </>
            )}
            {isLoading ? (
              <div className="flex items-center gap-1">
                <Skeleton circle containerClassName="avatar-skeleton w-[16px] text-[16px]" />
                <Skeleton width={40} />
              </div>
            ) : (
              <>
                <Avatar
                  label={
                    markets?.find((market) => market.address === position.marketAddress)
                      ?.description
                  }
                  size="xs"
                  gap="1"
                  fontSize="base"
                  fontWeight="bold"
                />
              </>
            )}
            {isLoading ? (
              <Skeleton width={40} />
            ) : (
              <>
                <Tag label={direction(position)} />
              </>
            )}
          </div>
          <div className="flex items-center gap-8 pl-6 border-l">
            <p className="text-black/50">Entry Price</p>
            {isLoading ? <Skeleton width={60} /> : <>${calculated.entryPrice}</>}
          </div>
          <div className="flex items-center gap-8 pl-6 border-l">
            <p className="text-black/50">Entry Time</p>
            {isLoading ? <Skeleton width={60} /> : <>{calculated.entryTime}</>}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {/* 상태에 따라 내용 변동 */}
          {position.status === OPENING && (
            <>
              <Loading size="sm" />
              <p className="flex text-black">
                {/* Opening in progress */}
                Waiting for the next oracle round
                <TooltipGuide iconOnly label="opening-in-progress" />
              </p>
            </>
          )}
          {position.status === OPENED && (
            <>
              <CheckIcon className="w-4" />
              <p className="flex text-black">
                Opening completed
                <TooltipGuide iconOnly label="opening-completed" />
              </p>
            </>
          )}
          {position.status === CLOSING && (
            <>
              <Loading size="sm" />
              <p className="flex text-black">
                Closing in progress
                <TooltipGuide iconOnly label="closing-in-progress" />
              </p>
            </>
          )}
          {position.status === CLOSED && (
            <>
              <CheckIcon className="w-4" />
              <p className="flex text-black">
                Closing completed
                <TooltipGuide iconOnly label="closing-completed" />
              </p>
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
          <div className="grow w-[20%] max-w-[280px] flex flex-col gap-2">
            <TextRow
              label="Contract Qty"
              labelClass="text-black/50"
              value={calculated.qty}
              isLoading={isLoading}
            />
            <TextRow
              label="Collateral"
              labelClass="text-black/50"
              value={calculated.collateral}
              isLoading={isLoading}
            />
          </div>
          <div className="grow w-[20%] flex flex-col gap-2 pl-6 border-l">
            <TextRow
              label="Take Profit"
              labelClass="text-black/50"
              value={calculated.takeProfit}
              isLoading={isLoading}
            />
            <TextRow
              label="TP Price"
              labelClass="text-black/50"
              value={calculated.profitPrice}
              subValueLeft={calculated.profitPriceTo}
              isLoading={isLoading}
            />
          </div>
          <div className="grow w-[20%] flex flex-col gap-2 pl-6 border-l">
            <TextRow
              label="Stop Loss"
              labelClass="text-black/50"
              value={calculated.stopLoss}
              isLoading={isLoading}
            />
            <TextRow
              label="SL Price"
              labelClass="text-black/50"
              value={calculated.lossPrice}
              subValueLeft={calculated.lossPriceTo}
              isLoading={isLoading}
            />
          </div>
          <div className="grow w-[16%] flex flex-col gap-2 pl-6 border-l">
            <TextRow
              label="PnL"
              labelClass="text-black/50"
              value={calculated.pnl}
              isLoading={isLoading}
            />
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
