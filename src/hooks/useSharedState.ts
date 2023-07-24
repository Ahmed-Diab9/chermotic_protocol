import useSWR from 'swr';
import { useSyncExternalStore } from 'react';

let listeners: Array<() => void> = [];
function emitChanges() {
  for (const listener of listeners) {
    listener();
  }
}
let storeValue= {}
const store = {
  setState(object :any) {
    storeValue = {
      ...storeValue,
      ...object
    }
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

function useSharedState(key: string, initialState: any) {
  const data = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const setter = (value:any)=>{
    store.setState({
      [key]: value
    })
  }
  return [
    data,
    setter
  ] as const;
}

export default useSharedState;
