import React from "react";
import { Header } from "../../stories/template/Header";
import { MainBar } from "../../stories/template/MainBar";
import { PoolPanel } from "../../stories/template/PoolPanel";
import { PoolProgress } from "~/stories/molecule/PoolProgress";
import { Footer } from "../../stories/template/Footer";
import { Button } from "../../stories/atom/Button";
import { AddressCopyButton } from "~/stories/atom/AddressCopyButton";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import "./style.css";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import useConnectOnce from "~/hooks/useConnectOnce";
import { useUsumAccount } from "~/hooks/useUsumAccount";
import { InjectedConnector } from "wagmi/connectors/injected";
import {
  useSelectedToken,
  useSettlementToken,
} from "~/hooks/useSettlementToken";
import { useMarket, useSelectedMarket } from "~/hooks/useMarket";
import {
  useUsumBalances,
  useUsumMargins,
  useWalletBalances,
} from "~/hooks/useBalances";
import usePriceFeed from "~/hooks/usePriceFeed";
import {
  useLiquidityPoolSummary,
  useSelectedLiquidityPool,
} from "~/hooks/useLiquidityPool";
import useTokenTransaction from "~/hooks/useTokenTransaction";
import { copyText } from "~/utils/clipboard";
import { useFeeRate } from "~/hooks/useFeeRate";
import { Link } from "react-router-dom";
import { trimAddress } from "~/utils/address";
import usePoolInput from "~/hooks/usePoolInput";
import { useAppSelector } from "~/store";
import usePoolReceipt from "~/hooks/usePoolReceipt";
import {
  useMultiPoolRemoveInput,
  usePoolRemoveInput,
} from "~/hooks/usePoolRemoveInput";

const Pool = () => {
  useConnectOnce();
  const { connectAsync } = useConnect();
  const { address: walletAddress } = useAccount();
  const {
    account: usumAccount,
    createAccount: createUsumAccount,
    status,
  } = useUsumAccount();
  const { tokens } = useSettlementToken();
  console.log("[pool] tokens", tokens);
  const { markets } = useMarket();
  const [_, onTokenSelect] = useSelectedToken();
  // const selectedToken = useAppSelector((state) => state.market.selectedToken);
  const { selectedMarket, onMarketSelect } = useSelectedMarket();
  console.log("[pool] selectedMarket", selectedMarket);
  // const feeRate = useFeeRate();
  const [walletBalances] = useWalletBalances();
  const { usumBalances } = useUsumBalances();
  const [priceFeed] = usePriceFeed();
  const pools = useLiquidityPoolSummary();
  const { disconnectAsync } = useDisconnect();
  const [balanceAmount, onBalanceAmountChange, onDeposit, onWithdraw] =
    useTokenTransaction();
  const selectedBins = useAppSelector((state) => state.pools.selectedBins);
  const isRemoveModalOpen = useAppSelector((state) => state.pools.isModalOpen);
  // const { receipts, onClaimCLBTokens, onClaimCLBTokensBatch } =
  //   usePoolReceipt();
  const {
    pool,
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
    onRemoveLiquidity,
    onRemoveLiquidityBatch,
  } = useSelectedLiquidityPool();

  const {
    amount,
    indexes,
    rates,
    bins,
    averageBin,
    onAmountChange,
    onRangeChange,
    onFullRangeSelect,
    onAddLiquidity,
  } = usePoolInput();
  const {
    amount: removeAmount,
    maxAmount: maxRemoveAmount,
    onAmountChange: onRemoveAmountChange,
    onMaxChange: onRemoveMaxAmountChange,
  } = usePoolRemoveInput();
  const {
    type: multiType,
    amount: multiAmount,
    balance: multiBalance,
    liquidityValue: multiLiquidityValue,
    removableLiquidity: multiFreeLiquidity,
    removableRate: multiRemovableRate,
    onAmountChange: onMultiAmountChange,
  } = useMultiPoolRemoveInput();
  const { totalBalance, totalAsset, totalMargin } = useUsumMargins();

  console.log("pool rerendering");
  console.log("WALLET BLAANCES", walletBalances);
  // console.log("[pool] tokens", tokens);
  // console.log("[pool] priceFeed", priceFeed);
  return (
    <div className="flex flex-col min-h-[100vh] w-full">
      <Header
        account={{ walletAddress, usumAddress: usumAccount?.address }}
        tokens={tokens}
        markets={markets}
        priceFeed={undefined}
        balances={walletBalances}
        pools={pools}
        onConnect={() => {
          connectAsync({
            connector: new InjectedConnector(),
          });
        }}
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
          // selectedToken={selectedToken}
          // selectedMarket={selectedMarket}
          // feeRate={feeRate}
          walletBalances={walletBalances}
          usumBalances={usumBalances}
          amount={balanceAmount}
          totalBalance={totalBalance}
          availableMargin={totalMargin}
          assetValue={totalAsset}
          onTokenSelect={onTokenSelect}
          onMarketSelect={onMarketSelect}
          onAmountChange={onBalanceAmountChange}
          onDeposit={onDeposit}
          onWithdraw={onWithdraw}
          onConnect={connectAsync}
          onStatusUpdate={createUsumAccount}
        />
        <div className="flex items-stretch gap-5">
          <div className="flex-auto w-3/5">
            <PoolPanel
              // token={selectedToken}
              market={selectedMarket}
              balances={walletBalances}
              pool={pool}
              amount={amount}
              indexes={indexes}
              rates={rates}
              bins={bins}
              averageBin={averageBin}
              longTotalMaxLiquidity={longTotalMaxLiquidity}
              longTotalUnusedLiquidity={longTotalUnusedLiquidity}
              shortTotalMaxLiquidity={shortTotalMaxLiquidity}
              shortTotalUnusedLiquidity={shortTotalUnusedLiquidity}
              selectedBins={selectedBins}
              isModalOpen={isRemoveModalOpen}
              onAmountChange={onAmountChange}
              onRangeChange={onRangeChange}
              onFullRangeSelect={onFullRangeSelect}
              onAddLiquidity={onAddLiquidity}
              removeAmount={removeAmount}
              maxRemoveAmount={maxRemoveAmount}
              onRemoveAmountChange={onRemoveAmountChange}
              onRemoveMaxAmountChange={onRemoveMaxAmountChange}
              onRemoveLiquidity={onRemoveLiquidity}
              onRemoveLiquidityBatch={onRemoveLiquidityBatch}
              multiType={multiType}
              multiAmount={multiAmount}
              multiBalance={multiBalance}
              multiLiquidityValue={multiLiquidityValue}
              multiFreeLiquidity={multiFreeLiquidity}
              multiRemovableRate={multiRemovableRate}
              onMultiAmountChange={onMultiAmountChange}
            />
            {/* bottom */}
            <article className="px-5 pt-5 pb-6 mx-auto mt-5 border rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold">
                    Token(ERC-1155) Contract Address
                  </h4>
                  {/* tooltip */}
                </div>
              </div>
              <p className="mt-3 text-left text-black/30">
                Please set additional values to apply to the basic formula in
                Borrow Fee. Calculated based on open Interest and stop
                profit/Loss rate.
              </p>
              <div className="flex justify-end gap-2 mt-6">
                <AddressCopyButton
                  address="ADDRESS"
                  onClick={() => {}}
                  // address={
                  //   selectedToken && trimAddress(selectedToken.address, 6, 6)
                  // }
                  // onClick={() => {
                  //   if (selectedToken) {
                  //     copyText(selectedToken.address);
                  //   }
                  // }}
                />
                <Link to={"/trade"}>
                  <Button
                    label="Trade on ETH/USDC Pool"
                    iconRight={<ChevronRightIcon />}
                    size="lg"
                  />
                </Link>
              </div>
            </article>
          </div>
          <div className="w-2/5 max-w-[500px] min-w-[480px]">
            <PoolProgress
              // token={selectedToken}
              market={selectedMarket}
              // receipts={receipts}
              // onReceiptClaim={onClaimCLBTokens}
              // onReceiptClaimBatch={onClaimCLBTokensBatch}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pool;
