import { isNil, isNotNil } from 'ramda';
import { useCallback } from 'react';
import { Address, useAccount, useDisconnect, usePublicClient } from 'wagmi';

import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useCreateAccount } from '~/hooks/useCreateAccount';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';

import { useNavigate } from 'react-router-dom';
import { formatUnits } from 'viem';
import useMarkets from '~/hooks/commons/useMarkets';
import { useEntireChromaticLp } from '~/hooks/useChromaticLp';
import { useEntireMarkets } from '~/hooks/useMarket';
import { ADDRESS_ZERO, trimAddress } from '~/utils/address';
import { copyText } from '~/utils/clipboard';
import { formatDecimals, numberFormat } from '~/utils/number';

type FormattedLp = {
  key: string;
  name: string;
  clpSymbol: string;
  image: string;
  token: string;
  tokenImage: string;
  market: string;
  balance: string;
};

export const useWalletPopoverV3Body = () => {
  const { address: walletAccount } = useAccount();
  const { accountAddress: chromaticAccount, isChromaticBalanceLoading } = useChromaticAccount();
  const { onCreateAccountWithToast } = useCreateAccount();
  const { tokens, onTokenSelect } = useSettlementToken();
  const { onMarketSelect } = useMarkets();
  const { tokenBalances, isTokenBalanceLoading } = useTokenBalances();

  const isLoading = isTokenBalanceLoading || isChromaticBalanceLoading;
  const { markets } = useEntireMarkets();
  const { lpList } = useEntireChromaticLp();
  const { disconnectAsync } = useDisconnect();
  const navigate = useNavigate();
  function onCreateAccount() {
    return onCreateAccountWithToast();
  }
  function onDisconnect() {
    return disconnectAsync();
  }

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
      balance: string;
      explorerUrl?: string;
      image: string;
    }[]
  >((acc, token) => {
    // if (isNil(tokenBalances[token.address])) return acc;
    const balance = tokenBalances?.[token.address];
    if (isNil(balance) || balance === 0n) {
      return acc;
    }
    const key = token.address;
    const name = token.name;
    const image = token.image;

    const formattedBalance = numberFormat(
      formatUnits(tokenBalances?.[token.address] || 0n, token.decimals),
      {
        maxDigits: 5,
        useGrouping: true,
        roundingMode: 'floor',
        type: 'string',
      }
    );
    const explorerUrl = getExplorerUrl('token', token.address);
    acc.push({ key, name, balance: formattedBalance, explorerUrl, image });
    return acc;
  }, []);
  const isAssetEmpty = assets.length === 0;

  const formattedLps = (lpList || []).reduce<FormattedLp[]>((acc, lp) => {
    if (lp.balance === 0n) {
      return acc;
    }
    const key = `${lp.settlementToken.name}-${lp.market.description}-${lp.name}`;
    const name = lp.name;
    const clpSymbol = lp.clpSymbol;
    const image = lp.image;

    const market = lp.market.description;
    const { name: tokenName, image: tokenImage } = lp.settlementToken;
    const balance = formatDecimals(lp.balance, lp.clpDecimals, 2, true);
    acc.push({ key, name, clpSymbol, token: tokenName, tokenImage, market, balance, image });
    return acc;
  }, []);
  const isLiquidityTokenEmpty = formattedLps.length === 0;

  const walletAddress = walletAccount ? trimAddress(walletAccount, 7, 5) : '-';
  function onCopyWalletAddress() {
    return isNotNil(walletAccount) && copyText(walletAccount);
  }

  const chromaticAddress = chromaticAccount ? trimAddress(chromaticAccount, 7, 5) : '-';
  function onCopyChromaticAddress() {
    return isNotNil(chromaticAccount) && copyText(chromaticAccount);
  }
  const isChromaticAccountExist = chromaticAccount && chromaticAccount !== ADDRESS_ZERO;
  const onLpClick = (tokenName: string, marketDescription: string) => {
    const token = tokens?.find((token) => token.name === tokenName);
    const market = markets?.find((market) => market.description === marketDescription);
    if (isNil(token) || isNil(market)) {
      return;
    }
    onTokenSelect(token);
    onMarketSelect(market);
    navigate('/pool');
  };
  return {
    onCreateAccount,
    onDisconnect,

    isLoading,

    chainName,

    accountExplorerUrl,

    assets,
    isAssetEmpty,

    formattedLps,
    isLiquidityTokenEmpty,

    walletAddress,
    onCopyWalletAddress,

    chromaticAddress,
    onCopyChromaticAddress,
    isChromaticAccountExist,

    onLpClick,
  };
};
