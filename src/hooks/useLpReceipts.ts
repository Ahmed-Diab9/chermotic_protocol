import { chromaticLpABI } from '@chromatic-protocol/liquidity-provider-sdk/contracts';
import axios from 'axios';
import { isNotNil } from 'ramda';
import useSWR from 'swr';
import { decodeEventLog } from 'viem';
import { Address, useAccount } from 'wagmi';
import { ARBISCAN_API_KEY, ARBISCAN_API_URL } from '~/constants/arbiscan';
import { ResponseLog } from '~/typings/position';
import { checkAllProps } from '~/utils';
import { divPreserved, formatDecimals } from '~/utils/number';
import { PromiseOnlySuccess } from '~/utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useMarket } from './useMarket';
import { useSettlementToken } from './useSettlementToken';

export interface LpReceipt {
  key: string;
  id: bigint;
  oracleVersion: bigint;
  timestamp: bigint;
  amount: bigint;
  mintedAmount: bigint;
  burnedAmount: bigint;
  remainedAmount: bigint;
  hasReturnedValue: boolean;
  isClosed: boolean;
  recipient: Address;
  action: 'minting' | 'burning';
  status: 'standby' | 'completed';
  message: string;
  detail: [string, string | undefined];
  token: {
    name?: string;
    decimals?: number;
    logo?: string;
  };
}

const getLpReceiptsByLog = async (lpAddress: Address, walletAddress: Address) => {
  const url = `${ARBISCAN_API_URL}/api?module=logs&action=getLogs&address=${lpAddress}&page=1&offset=1000&apikey=${ARBISCAN_API_KEY}`;
  const response = await axios.get(url);
  const responseData = response.data;
  const responseLogs =
    typeof responseData.result === 'string' ? [] : (responseData.result as ResponseLog[]);
  const reducedReceipts = responseLogs
    .map((value) =>
      decodeEventLog({
        abi: chromaticLpABI,
        data: value.data,
        topics: value.topics,
      })
    )
    .reduce((newMap, decoded) => {
      const { eventName } = decoded;
      if (
        eventName !== 'AddLiquidity' &&
        eventName !== 'AddLiquiditySettled' &&
        eventName !== 'RemoveLiquidity' &&
        eventName !== 'RemoveLiquiditySettled'
      ) {
        return newMap;
      }
      const { receiptId } = decoded.args;
      const mapValue =
        newMap.get(receiptId) ??
        ({
          isClosed: false,
        } as Partial<LpReceipt>);
      switch (eventName) {
        case 'AddLiquidity': {
          const { receiptId, recipient, amount, oracleVersion } = decoded.args;
          mapValue.action = 'minting';
          mapValue.id = receiptId;
          mapValue.recipient = recipient;
          mapValue.amount = amount;
          mapValue.oracleVersion = oracleVersion;
          break;
        }
        case 'AddLiquiditySettled': {
          const { lpTokenAmount, receiptId } = decoded.args;
          mapValue.id = receiptId;
          mapValue.mintedAmount = lpTokenAmount;
          mapValue.isClosed = true;
          break;
        }
        case 'RemoveLiquidity': {
          const { receiptId, recipient, lpTokenAmount, oracleVersion } = decoded.args;
          mapValue.action = 'burning';
          mapValue.id = receiptId;
          mapValue.recipient = recipient;
          mapValue.amount = lpTokenAmount;
          mapValue.oracleVersion = oracleVersion;
          break;
        }
        case 'RemoveLiquiditySettled': {
          const { receiptId, burningAmount, remainingAmount } = decoded.args;
          mapValue.id = receiptId;
          mapValue.burnedAmount = burningAmount;
          mapValue.remainedAmount = remainingAmount;
          mapValue.isClosed = true;
          mapValue.hasReturnedValue = remainingAmount !== 0n;
          break;
        }
      }
      newMap.set(receiptId, mapValue as LpReceipt);
      return newMap;
    }, new Map<bigint, LpReceipt>());

  const filteredReceipts = Array.from(reducedReceipts.values()).filter(
    (receipt) => receipt.recipient === walletAddress
  );
  return filteredReceipts;
};

export const useLpReceipts = () => {
  const { isReady, lpClient, client } = useChromaticClient();
  const { address } = useAccount();
  const { currentMarket } = useMarket();
  const { tokens } = useSettlementToken();
  const fetchKey = {
    key: 'getProviderReceipts',
    address,
    market: currentMarket,
    tokens,
  };

  const {
    data: receipts,
    error,
    mutate: fetchReceipts,
  } = useSWR(
    isReady && checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ address, market, tokens }) => {
      const registry = lpClient.registry();
      const lpAddresses = await registry.lpListByMarket(market.address);
      const receiptsResponse = lpAddresses.map(async (lpAddress) => {
        const lp = lpClient.lp();

        const settlementToken = tokens.find((token) => token.address === market.tokenAddress);
        const clpToken = await lp.lpTokenMeta(lpAddress);
        const rawReceipts = await getLpReceiptsByLog(lpAddress, address);
        const detailedReceipts = rawReceipts.map(async (receipt) => {
          const status =
            receipt.oracleVersion < market.oracleValue.version ? 'completed' : 'standby';
          let detail: string = '';

          const token = {
            name: receipt.action === 'minting' ? clpToken?.symbol : settlementToken?.name,
            decimals: receipt.action === 'minting' ? clpToken.decimals : settlementToken?.decimals,
            logo: receipt.action === 'burning' ? settlementToken?.image : undefined,
          };

          if (status === 'completed' && receipt.action === 'minting' && receipt.isClosed) {
            detail =
              formatDecimals(receipt.mintedAmount, token.decimals, 2, true) + ' ' + token.name;
          }

          // FIXME: The burned amount should be settlement token
          if (status === 'completed' && receipt.action === 'burning' && receipt.isClosed) {
            detail =
              formatDecimals(receipt.burnedAmount, token.decimals, 2, true) + ' ' + token.name;
          }
          let message = status === 'standby' ? 'Waiting for the next oracle round' : 'Completed';
          const key = `receipt-${receipt.id}-${receipt.action}-${status}`;

          if (receipt.action === 'burning' && receipt.remainedAmount > 0n) {
            const dividedByAmount = divPreserved(
              receipt.remainedAmount,
              receipt.amount,
              clpToken.decimals
            );
            const returnedRatio = formatDecimals(
              dividedByAmount * 100n,
              clpToken.decimals,
              2,
              true
            );
            message = `${returnedRatio}% withdrawn`;
          }
          const remainedDetail = isNotNil(receipt.remainedAmount)
            ? formatDecimals(receipt.remainedAmount, clpToken.decimals, 2, true)
            : undefined;

          const oracleProvider = await client.market().contracts().oracleProvider(market.address);
          const oracleValue = await oracleProvider.read.atVersion([receipt.oracleVersion]);
          const { timestamp } = oracleValue;

          return {
            ...receipt,
            key,
            status,
            message,
            detail: [detail, remainedDetail],

            timestamp,
            token,
          } satisfies LpReceipt;
        });
        return PromiseOnlySuccess(detailedReceipts);
      });
      const awaitedReceipts = await PromiseOnlySuccess(receiptsResponse);
      return awaitedReceipts.flat(1) as LpReceipt[];
    },
    {
      dedupingInterval: 5000,
    }
  );

  useError({ error });

  return { receipts, fetchReceipts };
};
