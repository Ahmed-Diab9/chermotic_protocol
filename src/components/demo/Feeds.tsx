type Feed = {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: number;
};
type FeedResponse = [BigNumber, string, string, string, BigNumber];

type FormState = {
  title: string;
  content: string;
};
type FormAction<T = "title" | "content"> = T extends "title"
  ? {
      type: T;
      payload: Pick<FormState, T>;
    }
  : T extends "content"
  ? { type: T; payload: Pick<FormState, T> }
  : never;

