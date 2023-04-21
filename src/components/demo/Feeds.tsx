import { BigNumber } from "ethers";
import { useContract, useNetwork, useSigner } from "wagmi";
import App from "../../abis/demo/App.json";
import { useCallback, useEffect, useReducer, useState } from "react";
import type { FormEvent } from "react";

/**
 * FIXME: need `.env.local`
 */
const contractAddress = import.meta.env.VITE_DEMO_CONTRACT;

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

const Feeds = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner({
    chainId: chain?.id,
    suspense: false,
  });
  const contract = useContract({
    address: contractAddress,
    abi: App.abi,
    signerOrProvider: signer,
  });
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [formState, formDispatch] = useReducer(
    (state: FormState, action: FormAction) => {
      switch (action.type) {
        case "title": {
          state = { ...state, title: action.payload.title };
          break;
        }
        case "content": {
          state = { ...state, content: action.payload.content };
          break;
        }
      }
      return state;
    },
    { title: "", content: "" } satisfies FormState
  );
  const fetchFeeds = useCallback(async () => {
    if (typeof signer === "undefined") {
      return;
    }
    const response: FeedResponse[] = await contract?.["getAllFeed"]();
    const nextFeeds = response.map((data) => {
      return {
        id: data[0].toNumber(),
        title: data[1],
        content: data[2],
        author: data[3],
        createdAt: data[4].toNumber(),
      } satisfies Feed;
    });
    setFeeds(nextFeeds);
  }, [contract, signer]);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await contract?.["createFeed"](formState.title, formState.content);
  };
  return (
    <div className="w-full flex gap-4">
      <div className="flex flex-col gap-4 w-full max-w-[720px]">
        {feeds.map((feed) => (
          <div className="flex flex-col items-start w-full" key={feed.id}>
            <div className="flex w-full">
              <h5 className="font-medium text-md">#{feed.id}</h5>
              <h5 className="font-medium text-md ml-auto">by {feed.author}</h5>
            </div>
            <h3 className="font-bold text-2xl">{feed.title}</h3>
            <p className="text-lg text-start">{feed.content}</p>
            <h5>{new Date(feed.createdAt * 1000).toLocaleString()}</h5>
          </div>
        ))}
      </div>
      <form
        method="post"
        className="flex flex-col gap-x-4 gap-y-2 items-start w-full"
        onSubmit={onSubmit}
      >
        <label htmlFor="title">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          className="border w-full"
          value={formState.title}
          onChange={(event) => {
            formDispatch({
              type: "title",
              payload: { title: event.target.value },
            });
          }}
        />
        <label htmlFor="content">Content</label>
        <textarea
          name="content"
          id="content"
          className="w-full border"
          value={formState.content}
          onChange={(event) => {
            formDispatch({
              type: "content",
              payload: { content: event.target.value },
            });
          }}
        />
        <button type="submit" className="bg-black text-white px-2 py-0.5">
          Feed up!
        </button>
      </form>
    </div>
  );
};

export default Feeds;
