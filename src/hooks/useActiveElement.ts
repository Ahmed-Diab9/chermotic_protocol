import { useSyncExternalStore } from 'react';

export function useActiveElement() {
  function onSubscribe(onStoreChange: () => unknown) {
    document.addEventListener('click', onStoreChange);
    return () => {
      document.removeEventListener('click', onStoreChange);
    };
  }
  function onSnapshot() {
    return document.activeElement;
  }
  const activeElement = useSyncExternalStore(onSubscribe, onSnapshot);

  return activeElement;
}
