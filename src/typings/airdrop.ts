import { Address } from 'wagmi';

export type FilterType = 'today' | 'yesterday' | 'all';

export interface AirdropAsset {
  credit: number;
  booster: number;
}

export interface SyncZealy {
  synced_count: number;
}

export interface AirdropHistory {
  id: number;
  address: Address;
  name: 'Credit' | 'Booster';
  score: number;
  credit: number;
  booster: number;
  activity_type: 'SignInReward' | 'Gleam' | 'Zealy';
  created_at: string;
}

export interface SignInReward {
  reward_credit: number;
  reward_booster: number;
  total_credit: number;
  round: number;
}

export interface AirdropSchedule {
  id: number;
  date: Date;
  name: 'Sun' | 'Mon' | 'Tues' | 'Wed' | 'Thur' | 'Fri' | 'Sat';
  round: number;
  credit: number;
  booster: number;
  created_at: Date;
  attendance: boolean;
  status: 'success' | 'fail' | 'active' | 'empty';
}

export interface AirdropBonusReward {
  consecutive: number;
  credit: number;
  booster: number;
}

export interface AirdropScheduleResponse {
  schedules: AirdropSchedule[];
  bonus_rewards: AirdropBonusReward[];
}

export interface LeaderBoard {
  participants: number;
  total_credit: number;
  total_booster: number;
  data: Ranking[];
}

export interface Ranking {
  rank: number;
  address: Address;
  credit: number;
  booster: number;
}
