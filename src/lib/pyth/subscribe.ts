import { isNil } from 'ramda';
import { PYTH_HERMES_PRICEFEED, PYTH_HERMES_IDS } from '~/constants/pyth';

import { PriceServiceConnection } from '@pythnetwork/price-service-client';
import { PythStreamData } from './types';

export const EVENT = 'price-update';

export function subscribePythFeed() {
  const connection = new PriceServiceConnection(PYTH_HERMES_PRICEFEED);

  const markets = ['Crypto.BTC/USD', 'Crypto.ETH/USD'];

  const priceIds = Object.keys(PYTH_HERMES_IDS).filter((market) =>
    markets.includes(PYTH_HERMES_IDS[market])
  );

  connection.subscribePriceFeedUpdates(priceIds, (priceFeed) => {
    const price = priceFeed.getPriceNoOlderThan(60);

    if (isNil(price)) return;

    const data = {
      id: PYTH_HERMES_IDS[`0x${priceFeed.id}`],
      p: +price.price * 10 ** price.expo,
      t: price.publishTime,
    };

    window.dispatchEvent(
      new CustomEvent(EVENT, {
        detail: data,
      })
    );
  });

  function disconncet() {
    try {
      connection.closeWebSocket();
    } catch (e) {
      console.log(e);
    }
  }

  return disconncet;
}

export function listenPriceFeed(callBack: (event: CustomEvent<PythStreamData>) => void) {
  window.addEventListener(EVENT, callBack as EventListener);
  return () => window.removeEventListener(EVENT, callBack as EventListener);
}
