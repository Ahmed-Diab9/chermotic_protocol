import { isNil } from 'ramda';
import { useMemo } from 'react';
import { useAirdropAssets } from '~/hooks/airdrops/useAirdropAssets';
import { numberFormat } from '~/utils/number';

export const useAirdropActivity = () => {
  const { airdropAssets, isLoading } = useAirdropAssets();

  const formattedCredit = useMemo(() => {
    if (isNil(airdropAssets)) {
      return '0';
    }
    return numberFormat(airdropAssets.credit, { useGrouping: true });
  }, [airdropAssets]);

  return { airdropAssets, formattedCredit, isLoading };
};
