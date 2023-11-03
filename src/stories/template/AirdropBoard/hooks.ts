import { isNil } from 'ramda';
import { useMemo } from 'react';
import { useAirdropLeaderBoard } from '~/hooks/airdrops/useAirdropLeaderBoard';
import { useAppDispatch, useAppSelector } from '~/store';
import { airdropAction } from '~/store/reducer/airdrop';

const ADDRESS_PREFIX = '0x';

export const useAirdropBoard = () => {
  const { filterLabels, labelMap, selectedLabel } = useAppSelector((state) => state.airdrop);
  const dispatch = useAppDispatch();
  const { leaderboardData, metadata, isLoading } = useAirdropLeaderBoard({
    type: selectedLabel,
  });
  const leaderboard = useMemo(() => {
    return leaderboardData
      .map((board) => board.data)
      .flat(1)
      .map((board) => ({
        ...board,
        address: board.address.slice(ADDRESS_PREFIX.length, ADDRESS_PREFIX.length + 6),
      }));
  }, [leaderboardData]);
  const hasMoreLeaderBoard = useMemo(() => {
    if (isNil(metadata) || isLoading) {
      return false;
    }
    const sum = leaderboard.reduce(
      (sum, boardItem) => {
        sum.totalBooster += boardItem.booster;
        sum.totalCredit += boardItem.credit;
        return sum;
      },
      {
        totalCredit: 0,
        totalBooster: 0,
      }
    );

    return sum.totalBooster < metadata.totalBooster || sum.totalCredit < metadata.totalCredit;
  }, [metadata, leaderboard, isLoading]);

  const onLabelChange = (nextIndex: number) => {
    dispatch(airdropAction.onLabelSwitch(nextIndex));
  };

  return {
    filterLabels,
    labelMap,
    activeLabel: selectedLabel,
    leaderboard,
    hasMoreLeaderBoard,
    onLabelChange,
  };
};
