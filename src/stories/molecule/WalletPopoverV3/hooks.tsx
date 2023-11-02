import { isNil, isNotNil } from 'ramda';
import { useCallback } from 'react';
import { Address, useAccount, useConnect, useDisconnect, usePublicClient } from 'wagmi';

import { useChain } from '~/hooks/useChain';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useCreateAccount } from '~/hooks/useCreateAccount';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';

import { useNavigate } from 'react-router-dom';
import { formatUnits } from 'viem';
import { useEntireChromaticLp } from '~/hooks/useChromaticLp';
import { useEntireMarkets, useMarket } from '~/hooks/useMarket';
import { ADDRESS_ZERO, trimAddress } from '~/utils/address';
import { copyText } from '~/utils/clipboard';
import { formatDecimals, numberFormat } from '~/utils/number';

type FormattedLp = {
  key: string;
  name: string;
  clpName: string;
  image: string;
  token: string;
  market: string;
  balance: string;
};

export function useWalletPopoverV3() {
  const { connectAsync, connectors } = useConnect();
  const { address: walletAccount } = useAccount();
  const { accountAddress: chromaticAccount, isChromaticBalanceLoading } = useChromaticAccount();
  const { onCreateAccountWithToast } = useCreateAccount();
  const { tokens, onTokenSelect } = useSettlementToken();
  const { markets } = useEntireMarkets();
  const { onMarketSelect } = useMarket();
  const { tokenBalances, isTokenBalanceLoading } = useTokenBalances();
  const { lpList } = useEntireChromaticLp();
  const { disconnectAsync } = useDisconnect();
  const { switchChain } = useChain();
  const navigate = useNavigate();

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
    const key = token.address;
    const name = token.name;
    const image = token.image;

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
    acc.push({ key, name, balance, explorerUrl, image });
    return acc;
  }, []);
  const isAssetEmpty = assets.length === 0;

  const formattedLps = (lpList || []).reduce<FormattedLp[]>((acc, lp) => {
    const key = `${lp.settlementToken.name}-${lp.market.description}-${lp.name}`;
    const name = lp.name;
    const clpName = lp.clpName;
    const image = lp.image;

    const market = lp.market.description;
    const token = lp.settlementToken.name;
    const balance = formatDecimals(lp.balance, lp.decimals, 2, true);
    acc.push({ key, name, clpName, token, market, balance, image });
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
    navigate('/pool3');
  };
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

    formattedLps,
    isLiquidityTokenEmpty,

    walletAddress,
    onCopyWalletAddress,

    chromaticAddress,
    onCopyChromaticAddress,
    isChromaticAccountExist,

    onLpClick,
  };
}
