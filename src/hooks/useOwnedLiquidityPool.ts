import useSWR from 'swr';
import { useAccount, useSigner } from 'wagmi';
import { utils as ChromaticUtils } from '@chromatic-protocol/sdk';
import { useChromaticClient } from '~/hooks/useChromaticClient';
import { useAppSelector } from '~/store';
import { isValid } from '~/utils/valid';
import { filterIfFulfilled } from '~/utils/array';
import { OwnedBin } from '~/typings/pools';
import { useCallback, useMemo } from 'react';
import { Logger } from '../utils/log';

interface Props {
  marketAddress?: string;
}

const logger = Logger('useOwneLiquidityPoolByMarket');
export const useOwnedLiquidityPool = (props: Props) => {
  const { encodeTokenId } = ChromaticUtils;
  const { address } = useAccount();
  const { marketAddress: previousMarketAddress } = props;
  // const market = useAppSelector((state) => state.market.selectedMarket);
  const { client } = useChromaticClient();
  const { data: signer } = useSigner();
  const routerApi = useMemo(() => client?.router(), [client]);

  const marketAddress = previousMarketAddress;
  const fetchKey =
    isValid(address) && isValid(marketAddress) ? [address, marketAddress] : undefined;

  const {
    data: ownedPool,
    error,
    mutate: fetchOwnedPool,
  } = useSWR(fetchKey, async ([address, marketAddress]) => {
    if (!isValid(client)) {
      return;
    }
    const bins = await client.lens().ownedLiquidityBins(marketAddress, address);
    const binsResponse = bins.map(async (bin) => {
      const tokenId = encodeTokenId(bin.tradingFeeRate, bin.tradingFeeRate > 0);
      const { name, decimals, description, image } = await client
        .market()
        .clbTokenMeta(marketAddress, tokenId);
      return {
        liquidity: bin.liquidity,
        freeLiquidity: bin.freeLiquidity,
        removableRate: bin.removableRate,
        clbTokenName: name,
        clbTokenImage: image,
        clbTokenDescription: description,
        clbTokenDecimals: decimals,
        clbTokenBalance: bin.clbBalance,
        clbTokenValue: bin.clbValue,
        clbTotalSupply: bin.clbTotalSupply,
        binValue: bin.clbBalance.mul(bin.clbValue),
        baseFeeRate: bin.tradingFeeRate,
        tokenId: tokenId,
      } satisfies OwnedBin;
    });
    const filteredBins = await filterIfFulfilled(binsResponse);
    return {
      marketAddress,
      bins: filteredBins,
    };
  });

  // const onRemoveLiquidity = useCallback(
  //   async (feeRate: number, amount: number) => {
  //     if (!isValid(signer) || !isValid(address)) {
  //       logger.info('no signer or address', signer, address);
  //       return;
  //     }
  //     if (!isValid(ownedPools)) {
  //       logger.info('no pool');
  //       return;
  //     }
  //     if (!isValid(routerApi)) {
  //       logger.info('no clients');
  //       return;
  //     }
  //     const routerAddress = routerApi.routerContract.address;
  //     const expandedAmount = bigNumberify(amount).mul(expandDecimals(token?.decimals ?? 1));

  //     await routerApi.removeLiquidity(ownedPools.marketAddress, {
  //       feeRate,
  //       receipient: address,
  //       clbTokenAmount: expandedAmount,
  //     });
  //     await fetchReceipts();
  //     await fetchWalletBalances();
  //   },
  //   [signer, address, pool, routerApi]
  // );

  // const onRemoveLiquidityBatch = useCallback(
  //   async (bins: Bin[], type: MULTI_TYPE) => {
  //     if (!isValid(signer) || !isValid(address) || !isValid(market)) {
  //       return;
  //     }
  //     if (!isValid(pool)) {
  //       return;
  //     }
  //     if (!isValid(routerApi)) {
  //       return;
  //     }
  //     const amounts = bins.map((bin) => {
  //       const { clbTokenBalance, clbTokenValue, freeLiquidity } = bin;
  //       const liquidityValue = clbTokenBalance
  //         .mul(clbTokenValue)
  //         .div(expandDecimals(BIN_VALUE_DECIMAL));
  //       const removable = liquidityValue.lt(freeLiquidity) ? liquidityValue : freeLiquidity;

  //       return type === MULTI_ALL ? clbTokenBalance : removable;
  //     });
  //     await routerApi.removeLiquidities(
  //       market.address,
  //       bins.map((bin, binIndex) => ({
  //         feeRate: bin.baseFeeRate,
  //         clbTokenAmount: amounts[binIndex],
  //         receipient: address,
  //       }))
  //     );
  //     await fetchReceipts();
  //     await fetchWalletBalances();
  //   },
  //   [signer, market, pool, routerApi]
  // );

  return {
    ownedPool,
    fetchOwnedPool,
  };
};
