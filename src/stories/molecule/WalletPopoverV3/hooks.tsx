import { isNil, isNotNil } from 'ramda';
import { useCallback } from 'react';
import { Address, useAccount, useConnect, useDisconnect, usePublicClient } from 'wagmi';

import { useChain } from '~/hooks/useChain';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useCreateAccount } from '~/hooks/useCreateAccount';
import { useOwnedLiquidityPools } from '~/hooks/useOwnedLiquidityPools';
import usePriceFeed from '~/hooks/usePriceFeed';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';

import { PRICE_FEED } from '~/configs/token';

import { Token } from '~/typings/market';

import { formatUnits } from 'viem';
import { ADDRESS_ZERO, trimAddress } from '~/utils/address';
import { copyText } from '~/utils/clipboard';
import { formatBalance, formatDecimals, numberFormat, withComma } from '~/utils/number';

export function useWalletPopoverV3() {
  const { connectAsync, connectors } = useConnect();
  const { address: walletAccount } = useAccount();
  const { accountAddress: chromaticAccount, isChromaticBalanceLoading } = useChromaticAccount();
  const { onCreateAccountWithToast } = useCreateAccount();
  const { tokens } = useSettlementToken();
  const { tokenBalances, isTokenBalanceLoading } = useTokenBalances();
  const { priceFeed } = usePriceFeed();
  const { ownedPoolSummary } = useOwnedLiquidityPools();
  const { disconnectAsync } = useDisconnect();
  const { switchChain } = useChain();

  const isLoading = isTokenBalanceLoading || isChromaticBalanceLoading;

  function onConnect() {
    return connectAsync({ connector: connectors[0] });
  }
  function onSwitchChain() {
    return switchChain();
  }
  function onCreateAccount() {
    return onCreateAccountWithToast();
  }
  function onDisconnect() {
    return disconnectAsync();
  }

  const getTokenPrice = useCallback(
    (token: Token) => {
      if (!tokenBalances || !priceFeed) return '';
      const priceFeedAddress = PRICE_FEED[token.name] || '0x';
      if (isNotNil(tokenBalances[token.address]) && isNotNil(priceFeed[priceFeedAddress])) {
        const balance = tokenBalances[token.address];
        const tokenDecimals = token.decimals;
        const price = priceFeed[priceFeedAddress].value;
        const priceDecimals = priceFeed[priceFeedAddress].decimals;
        return `${withComma(formatBalance(balance, price, tokenDecimals, priceDecimals))}`;
      }
      return '-';
    },
    [tokenBalances, priceFeed]
  );

  const publicClient = usePublicClient();

  const chainName = publicClient.chain.name || 'Unknown';
  const getExplorerUrl = useCallback(
    (type: 'token' | 'address', address?: Address) => {
      try {
        const rawUrl = publicClient.chain.blockExplorers?.default?.url;
        if (isNil(rawUrl)) return;
        const origin = new URL(rawUrl).origin;
        if (isNil(origin) || isNil(address)) return;
        return `${origin}/${type}/${address}`;
      } catch (error) {
        return;
      }
    },
    [publicClient]
  );

  const accountExplorerUrl = getExplorerUrl('address', walletAccount);

  const assets = (tokens || []).reduce<
    {
      key: string;
      name: string;
      usdPrice: string;
      balance: string;
      explorerUrl?: string;
      image: string;
    }[]
  >((acc, token) => {
    // if (isNil(tokenBalances[token.address])) return acc;
    const key = token.address;
    const name = token.name;
    const image = token.image;
    const usdPrice = getTokenPrice(token);
    const balance = numberFormat(
      formatUnits(tokenBalances?.[token.address] || 0n, token.decimals),
      {
        maxDigits: 5,
        useGrouping: true,
        roundingMode: 'floor',
        type: 'string',
      }
    );
    const explorerUrl = getExplorerUrl('token', token.address);
    acc.push({ key, name, usdPrice, balance, explorerUrl, image });
    return acc;
  }, []);
  const isAssetEmpty = assets.length === 0;

  const liquidityTokens = (ownedPoolSummary || []).reduce<
    {
      key: string;
      name: string;
      image: string;
      market: string;
      liquidity: string;
      bins: number;
    }[]
  >((acc, pool) => {
    const key = `${pool.token.name}-${pool.market}`;
    const name = pool.token.name;
    const image = pool.image;

    const market = pool.market;
    const liquidity = formatDecimals(pool.liquidity, pool.token.decimals, 2, true);
    const bins = pool.bins;
    acc.push({ key, name, market, liquidity, bins, image });
    return acc;
  }, []);
  const isLiquidityTokenEmpty = liquidityTokens.length === 0;

  const walletAddress = walletAccount ? trimAddress(walletAccount, 7, 5) : '-';
  function onCopyWalletAddress() {
    return isNotNil(walletAccount) && copyText(walletAccount);
  }

  const chromaticAddress = chromaticAccount ? trimAddress(chromaticAccount, 7, 5) : '-';
  function onCopyChromaticAddress() {
    return isNotNil(chromaticAccount) && copyText(chromaticAccount);
  }
  const isChromaticAccountExist = chromaticAccount && chromaticAccount !== ADDRESS_ZERO;

  return {
    onConnect,
    onSwitchChain,
    onCreateAccount,
    onDisconnect,

    isLoading,

    chainName,

    accountExplorerUrl,

    assets,
    isAssetEmpty,

    liquidityTokens,
    isLiquidityTokenEmpty,

    walletAddress,
    onCopyWalletAddress,

    chromaticAddress,
    onCopyChromaticAddress,
    isChromaticAccountExist,
  };
}
