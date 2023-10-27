import axios from 'axios';
import { useCallback } from 'react';
import useSWRInfinite from 'swr/infinite';
import { LeaderBoard } from '~/typings/airdrop';
import { useError } from './useError';

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
      const url = `/airdrops/leaderboard/${type}?page=${pageIndex + 1}&limit=${limit}`;

      return url;
    },
    async (url) => {
      const response = await axios.get(url);
      const leaderboard = response.data as LeaderBoard;

      return leaderboard;
    }
  );

  const fetchNextLeaderBoard = useCallback(() => {
    setSize(size + 1);
  }, [size, setSize]);

  const refreshLeaderBoard = useCallback(() => {
    mutate();
  }, [mutate]);

  useError({ error });

  return {
    leaderboardData,
    isLoading,
    fetchNextLeaderBoard,
    refreshLeaderBoard,
  };
};
