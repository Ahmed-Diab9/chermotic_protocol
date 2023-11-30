import { ResolutionString, SubscribeBarsCallback } from '~/lib/charting_library';

export type Bar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type Handler = {
  id: string;
  callback: SubscribeBarsCallback;
};

export type SubscriptionItem = {
  subscriberUID: string;
  resolution: ResolutionString;
  lastBar: Bar;
  handlers: Handler[];
};

export type PythStreamData = {
  id: string;
  p: number;
  t: number;
};
