import React, { useEffect } from "react";
import { Header } from "../../stories/template/Header";
import { MainBar } from "../../stories/template/MainBar";
import { TradePanel } from "../../stories/template/TradePanel";
import { TradeBar } from "~/stories/template/TradeBar";
import { Button } from "../../stories/atom/Button";

import "./style.css";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useUsumAccount } from "~/hooks/useUsumAccount";
import {
  useSelectedToken,
  useSettlementToken,
} from "~/hooks/useSettlementToken";
import { useMarket, useSelectedMarket } from "~/hooks/useMarket";
import usePriceFeed from "~/hooks/usePriceFeed";
import {
  useUsumBalances,
  useUsumMargins,
  useWalletBalances,
} from "~/hooks/useBalances";
import {
  useLiquidityPoolSummary,
  useSelectedLiquidityPool,
} from "~/hooks/useLiquidityPool";
import { copyText } from "~/utils/clipboard";
import useConnectOnce from "~/hooks/useConnectOnce";
import { useFeeRate } from "~/hooks/useFeeRate";
import useTokenTransaction from "~/hooks/useTokenTransaction";
import { useTradeInput } from "~/hooks/useTradeInput";
import { Link } from "react-router-dom";
import { usePosition } from "~/hooks/usePosition";
import { infoLog } from "~/utils/log";
import useOracleVersion from "~/hooks/useOracleVersion";

const Trade = () => {
  useConnectOnce();
  const { connectAsync } = useConnect();
  const { address: walletAddress } = useAccount();
  const [usumAccount, createUsumAccount] = useUsumAccount();
  const [tokens] = useSettlementToken();
  const [markets] = useMarket();
  const [selectedToken, onTokenSelect] = useSelectedToken();
  const [selectedMarket, onMarketSelect] = useSelectedMarket();
  const feeRate = useFeeRate();
  const [walletBalances] = useWalletBalances();
  const { usumBalances } = useUsumBalances();
  const [priceFeed] = usePriceFeed();
  const pools = useLiquidityPoolSummary();
  const { disconnectAsync } = useDisconnect();
  const [amount, onAmountChange, onDeposit, onWithdraw] = useTokenTransaction();
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
  } = useSelectedLiquidityPool();
  const { oracleVersions } = useOracleVersion();
  const { totalBalance, totalAsset, totalMargin } = useUsumMargins();

  useEffect(() => {
    if (shortInput.direction === "long") {
      onShortDirectionToggle();
    }
  }, [shortInput.direction, onShortDirectionToggle]);
  const { positions, onClosePosition, onClaimPosition } = usePosition();

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
      <section className="flex flex-col grow max-w-[1400px] px-5 mx-auto mb-20">
        <MainBar
          account={{ walletAddress, usumAddress: usumAccount?.address }}
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
          onTokenSelect={(token) => {
            onTokenSelect(token);
          }}
          onMarketSelect={(market) => {
            onMarketSelect(market);
          }}
          onAmountChange={onAmountChange}
          onDeposit={onDeposit}
          onWithdraw={onWithdraw}
          onConnect={connectAsync}
        />
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
          onOpenLongPosition={onOpenLongPosition}
          onOpenShortPosition={onOpenShortPosition}
        />
        <article className="max-w-[680px] w-full mt-8 mx-auto">
          <div className="mb-12">
            <p className="my-6 text-center text-black/30">
              Please set additional values to apply to the basic formula in
              Borrow Fee. <br /> Calculated based on open Interest and stop
              profit/Loss rate.
            </p>
            <Link to={"/pool"}>
              <Button label="Provide Liquidity" />
            </Link>
          </div>
        </article>
      </section>
      <TradeBar
        token={selectedToken}
        markets={markets}
        positions={positions}
        oracleVersions={oracleVersions}
        onPositionClose={(marketAddress, positionId) => {
          onClosePosition(marketAddress, positionId);
        }}
        onPositionClaim={(marketAddress, positionId) => {
          onClaimPosition(marketAddress, positionId);
        }}
      />
    </div>
  );
};

export default Trade;
