import "./style.css";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import { ChevronRightIcon } from "@heroicons/react/24/outline";

import { Header } from "~/stories/template/Header";
import { MainBar } from "~/stories/template/MainBar";
import { TradePanel } from "~/stories/template/TradePanel";
import { TradeBar } from "~/stories/template/TradeBar";
import { Button } from "~/stories/atom/Button";
import { Outlink } from "~/stories/atom/Outlink";
import {
  LiquidityTooltip,
  LiquidityTooltipData,
} from "~/stories/molecule/LiquidityTooltip";

import { useUsumAccount } from "~/hooks/useUsumAccount";
import { useTokenSelect, useSettlementToken } from "~/hooks/useSettlementToken";
import { useMarket, useMarketSelect } from "~/hooks/useMarket";
import usePriceFeed from "~/hooks/usePriceFeed";
import {
  useUsumBalances,
  useUsumMargins,
  useWalletBalances,
} from "~/hooks/useBalances";
import {
  useLiquidityPoolSummary,
  useBinsBySelectedMarket,
} from "~/hooks/useLiquidityPool";
import useConnectOnce from "~/hooks/useConnectOnce";
import { useFeeRate } from "~/hooks/useFeeRate";
import useTokenTransaction from "~/hooks/useTokenTransaction";
import { useTradeInput } from "~/hooks/useTradeInput";
import { usePosition } from "~/hooks/usePosition";
import useOracleVersion from "~/hooks/useOracleVersion";
import { useAppSelector } from "~/store";
import { useTokenLocal } from "~/hooks/useTokenLocal";
import { useMarketLocal } from "~/hooks/useMarketLocal";
import useChartData from "~/hooks/useChartData";

import { copyText } from "~/utils/clipboard";

const Trade = () => {
  useConnectOnce();
  const { connectAsync } = useConnect();
  const { address: walletAddress } = useAccount();
  const {
    account: usumAccount,
    createAccount: createUsumAccount,
    status,
  } = useUsumAccount();
  const { tokens } = useSettlementToken();
  const { markets } = useMarket();
  const onTokenSelect = useTokenSelect();
  const onMarketSelect = useMarketSelect();
  const selectedToken = useAppSelector((state) => state.token.selectedToken);
  const selectedMarket = useAppSelector((state) => state.market.selectedMarket);
  const feeRate = useFeeRate();
  const { walletBalances } = useWalletBalances();
  const { usumBalances } = useUsumBalances();
  const { priceFeed } = usePriceFeed();
  const pools = useLiquidityPoolSummary();
  const { disconnectAsync } = useDisconnect();
  const { amount, onAmountChange, onDeposit, onWithdraw } =
    useTokenTransaction();
  const {
    state: longInput,
    tradeFee: longTradeFee,
    feePercent: longFeePercent,
    onChange: onLongChange,
    onMethodToggle: onLongMethodToggle,
    onLeverageChange: onLongLeverageChange,
    onTakeProfitChange: onLongTakeProfitChange,
    onStopLossChange: onLongStopLossChange,
    onOpenPosition: onOpenLongPosition,
  } = useTradeInput();
  const {
    state: shortInput,
    tradeFee: shortTradeFee,
    feePercent: shortFeePercent,
    onChange: onShortChange,
    onMethodToggle: onShortMethodToggle,
    onDirectionToggle: onShortDirectionToggle,
    onLeverageChange: onShortLeverageChange,
    onTakeProfitChange: onShortTakeProfitChange,
    onStopLossChange: onShortStopLossChange,
    onOpenPosition: onOpenShortPosition,
  } = useTradeInput();
  const {
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  } = useBinsBySelectedMarket();
  const { oracleVersions } = useOracleVersion();
  const { totalBalance, totalAsset, totalMargin } = useUsumMargins();

  useEffect(() => {
    if (shortInput.direction === "long") {
      onShortDirectionToggle();
    }
  }, [shortInput.direction, onShortDirectionToggle]);
  const { positions, onClosePosition, onClaimPosition } = usePosition();
  useTokenLocal();
  useMarketLocal();

  const { positive, negative } = useChartData();

  const getTooltipGetter =
    (tooltip: LiquidityTooltipData[]) => (index: number) =>
      tooltip[index];

  return (
    <div className="flex flex-col min-h-[100vh] w-full">
      <Header
        account={{ walletAddress, usumAddress: usumAccount?.address }}
        tokens={tokens}
        markets={markets}
        priceFeed={priceFeed}
        balances={walletBalances}
        pools={pools}
        onConnect={connectAsync}
        onCreateAccount={createUsumAccount}
        onDisconnect={disconnectAsync}
        onWalletCopy={copyText}
        onUsumCopy={copyText}
      />
      <section className="flex flex-col grow w-full max-w-[1400px] px-5 mx-auto mb-20">
        <MainBar
          account={{ walletAddress, usumAddress: usumAccount?.address }}
          status={status}
          tokens={tokens}
          markets={markets}
          selectedToken={selectedToken}
          selectedMarket={selectedMarket}
          feeRate={feeRate}
          walletBalances={walletBalances}
          usumBalances={usumBalances}
          amount={amount}
          totalBalance={totalBalance}
          availableMargin={totalMargin}
          assetValue={totalAsset}
          onTokenSelect={onTokenSelect}
          onMarketSelect={onMarketSelect}
          onAmountChange={onAmountChange}
          onDeposit={onDeposit}
          onWithdraw={onWithdraw}
          onConnect={connectAsync}
          onStatusUpdate={createUsumAccount}
        />
        <div className="w-full min-w-[620px]">
          <TradePanel
            longInput={longInput}
            longTradeFee={longTradeFee}
            longTradeFeePercent={longFeePercent}
            onLongChange={onLongChange}
            onLongMethodToggle={onLongMethodToggle}
            onLongLeverageChange={onLongLeverageChange}
            onLongTakeProfitChange={onLongTakeProfitChange}
            onLongStopLossChange={onLongStopLossChange}
            shortInput={shortInput}
            shortTradeFee={shortTradeFee}
            shortTradeFeePercent={shortFeePercent}
            onShortChange={onShortChange}
            onShortMethodToggle={onShortMethodToggle}
            onShortLeverageChange={onShortLeverageChange}
            onShortTakeProfitChange={onShortTakeProfitChange}
            onShortStopLossChange={onShortStopLossChange}
            balances={usumBalances}
            priceFeed={priceFeed}
            token={selectedToken}
            market={selectedMarket}
            longTotalMaxLiquidity={longTotalMaxLiquidity}
            longTotalUnusedLiquidity={longTotalUnusedLiquidity}
            shortTotalMaxLiquidity={shortTotalMaxLiquidity}
            shortTotalUnusedLiquidity={shortTotalUnusedLiquidity}
            shortLiquidityData={negative.liquidity}
            longLiquidityData={positive.liquidity}
            shortTooltip={
              <LiquidityTooltip
                getByIndex={getTooltipGetter(negative.tooltip)}
              />
            }
            longTooltip={
              <LiquidityTooltip
                getByIndex={getTooltipGetter(positive.tooltip)}
              />
            }
            onOpenLongPosition={onOpenLongPosition}
            onOpenShortPosition={onOpenShortPosition}
          />
          <article className="w-full mx-auto mt-8 max-w-[840px]">
            <div className="mb-12">
              <p className="my-6 text-center text-black/30">
                The Trade Fee is calculated by summing up the different fees
                from the Liquidi- ty Bins that accept the positions. The EST.
                Trade Fee is calculated based on the current oracle price, and
                the actual fee paid is determined by the next oracle price.
                <Outlink outLink="#" className="ml-2" />
              </p>
              <Link to={"/pool"}>
                <Button
                  label="Provide Liquidity"
                  iconRight={<ChevronRightIcon />}
                />
              </Link>
            </div>
          </article>
        </div>
      </section>
      <TradeBar
        token={selectedToken}
        markets={markets}
        positions={positions}
        oracleVersions={oracleVersions}
        onPositionClose={onClosePosition}
        onPositionClaim={onClaimPosition}
      />
    </div>
  );
};

export default Trade;
