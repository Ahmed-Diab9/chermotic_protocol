import { chromaticAccountABI } from '@chromatic-protocol/sdk-viem/contracts';
import axios from 'axios';
import useSWR from 'swr';
import { getEventSelector } from 'viem';
import { ARBISCAN_API_KEY, ARBISCAN_API_URL } from '~/constants/arbiscan';
import { ResponseLog } from '~/typings/position';
import { checkAllProps } from '~/utils';
import { useChromaticAccount } from './useChromaticAccount';
import { useError } from './useError';

const eventSignature = getEventSelector({
  name: 'OpenPosition',
  type: 'event',
  inputs: chromaticAccountABI.find((abiItem) => abiItem.name === 'OpenPosition')!.inputs,
});

export const useInitialBlockNumber = () => {
  const { accountAddress } = useChromaticAccount();
  const fetchKey = { accountAddress, key: 'fetchInitialLogBlockNumber' };

  const { data: initialBlockNumber, error } = useSWR(
    checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ accountAddress }) => {
      const apiUrl = `${ARBISCAN_API_URL}/api?module=logs&action=getLogs&address=${accountAddress}&topic0=${eventSignature}&page=1&offset=1&apikey=${ARBISCAN_API_KEY}`;
      const apiResponse = await axios(apiUrl);
      const apiData = await apiResponse.data;
      const initialLog: ResponseLog[] = apiData.result;
      if (initialLog.length <= 0) {
        return undefined;
      }
      return BigInt(initialLog[0].blockNumber);
    }
  );

  useError({ error });
  return { initialBlockNumber };
};
