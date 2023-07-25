import { useEffect, useSyncExternalStore } from 'react';

let listeners: Array<() => void> = [];
function emitChanges() {
  for (const listener of listeners) {
    listener();
  }
}
let storeValue: { [key: string]: any } = {};
const store = {
  setState(object: any) {
    storeValue = {
      ...storeValue,
      ...object,
    };
    emitChanges();
  },
  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return storeValue;
  },
};

function useSharedState<T>(key: string, initialState?: T) {
  const data = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const setter = (value: T) => {
    store.setState({
      [key]: value,
    });
  };
  useEffect(() => {
    if (initialState) {
      setter(initialState);
    }
  }, []);
  return [data[key] as T, setter] as const;
}

export default useSharedState;
