import { useCallback, useEffect, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { airdropClient } from '~/apis/airdrop';
import { LeaderBoard } from '~/typings/airdrop';
import { REWARD_EVENT } from '~/typings/events';
import { useError } from '../useError';

interface UseAirdropLeaderBoard {
  type: 'today' | 'yesterday' | 'all';
}

export const useAirdropLeaderBoard = (props: UseAirdropLeaderBoard) => {
  const { type } = props;

  const {
    data: leaderboardData = [],
    error,
    size,
    isLoading,
    setSize,
    mutate,
  } = useSWRInfinite(
    (pageIndex: number, previousData: unknown) => {
      const limit = 5;
      const url = `/airdrop/leaderboard/${type}?page=${pageIndex + 1}&limit=${limit}`;

      return url;
    },
    async (url) => {
      const response = await airdropClient.get(url);
      const leaderboard = response.data as LeaderBoard;

      return leaderboard;
    }
  );
  const metadata = useMemo(() => {
    if (leaderboardData.length <= 0) {
      return;
    }
    const { total_booster, total_credit, participants } = leaderboardData[0];
    return {
      totalBooster: total_booster ?? 0,
      totalCredit: total_credit ?? 0,
      participants: participants ?? 0,
    };
  }, [leaderboardData]);

  const fetchNextLeaderBoard = useCallback(() => {
    setSize(size + 1);
  }, [size, setSize]);

  const refreshLeaderBoard = useCallback(() => {
    mutate();
  }, [mutate]);

  useEffect(() => {
    const onRewardRefresh = () => {
      refreshLeaderBoard();
    };
    window.addEventListener(REWARD_EVENT, onRewardRefresh);
    return () => {
      window.removeEventListener(REWARD_EVENT, onRewardRefresh);
    };
  }, [refreshLeaderBoard]);

  useError({ error });

  return {
    metadata,
    leaderboardData,
    isLoading,
    fetchNextLeaderBoard,
    refreshLeaderBoard,
  };
};
