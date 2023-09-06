import { Market } from '~/typings/market';
import { useChromaticClient } from './useChromaticClient';

interface Props {
  markets?: Market[];
}

export const usePreviousOracles = ({ markets }: Props) => {
  const { isReady, client } = useChromaticClient();
  const fetchKey = {
    name: 'getPreviousOracleVersions',
    markets,
  };
};
