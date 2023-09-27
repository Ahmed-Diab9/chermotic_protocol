import { useEffect } from 'react';
import useSWR from 'swr';
import { Address, useAccount } from 'wagmi';
import { checkAllProps } from '~/utils';
import { formatDecimals } from '~/utils/number';
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
  pendingLiquidity: bigint;
  recipient: Address;
  action: 'minting' | 'burning';
  status: 'standby' | 'completed';
  detail: string;
  token: {
    name: string;
    address: Address;
    decimals: number;
  };
}

const receiptStatus = (
  action: number,
  receiptOracleVersion: bigint,
  currentOracleVersion: bigint
) => {
  switch (action) {
    case 0: {
      if (receiptOracleVersion < currentOracleVersion) {
        return 'completed';
      }
      return 'standby';
    }
    case 1: {
      if (receiptOracleVersion >= currentOracleVersion) {
        return 'standby';
      }
      return 'completed';
    }
    default: {
      break;
    }
  }
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

  const { data: receipts, error } = useSWR(
    isReady && checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ address, market, tokens }) => {
      const registry = lpClient.registry();
      const lpAddresses = await registry.lpListByMarket(market.address);
      const receiptsResponse = lpAddresses.map(async (lpAddress) => {
        const lp = lpClient.lp();

        const settlementToken = tokens.find((token) => token.address === market.tokenAddress);
        const clpToken = await lp.lpTokenMeta(lpAddress);
        const receiptIds = await lp.getReceiptIdsOf(lpAddress, address);
        console.log(receiptIds, 'receipt ids');
        const receipts = receiptIds.map(async (receiptId) => {
          const receipt = await lp.getReceipt(lpAddress, receiptId);
          const action = receipt.action === 0 ? 'minting' : 'burning';
          const status = receiptStatus(
            receipt.action,
            receipt.oracleVersion,
            market.oracleValue.version
          );
          const token = action === 'minting' ? clpToken : settlementToken;
          if (status === 'standby' && action === 'minting') {
            return 'Waiting for the next oracle round';
          }
          const detail =
            formatDecimals(receipt.amount, token?.decimals, 2, true) + ' ' + token?.name;
          const key = `receipt-${receipt.id}-${action}-${status}`;
          const oracleProvider = await client.market().contracts().oracleProvider(market.address);
          const oracleValue = await oracleProvider.read.atVersion([receipt.oracleVersion]);
          const { timestamp } = oracleValue;

          return { ...receipt, key, action, status, token, detail, timestamp } as LpReceipt;
        });
        return PromiseOnlySuccess(receipts);
      });
      const awaitedReceipts = await PromiseOnlySuccess(receiptsResponse);
      return awaitedReceipts.flat(1) as LpReceipt[];
    },
    {
      dedupingInterval: 5000,
    }
  );

  useError({ error });
  useEffect(() => {
    console.log(receipts, 'receipts');
  }, [receipts]);

  return { receipts };
};
