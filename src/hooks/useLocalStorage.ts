import { useEffect, useSyncExternalStore } from "react";
import { isPrimitive, isValid } from "../utils/valid";

const cache = new Map<string, unknown>();
const handlers = new Set<(key: string) => unknown>();
const IS_PRIMITIVE = "__IS_PRIMITIVE__";

const useLocalStorage = <T>(key: string, defaultValue?: T) => {
  useEffect(() => {
    const cachedValue = cache.get(key);
    if (isValid(cachedValue)) {
      return;
    }
    const storedItem = window.localStorage.getItem(key);
    if (isValid(storedItem)) {
      const parsed = JSON.parse(storedItem);
      if (parsed[IS_PRIMITIVE]) {
        cache.set(key, parsed[key]);
      } else {
        cache.set(key, parsed);
      }
      return;
    }
    if (isValid(defaultValue)) {
      if (isPrimitive(defaultValue)) {
        const wrapped = {
          [IS_PRIMITIVE]: true,
          [key]: defaultValue,
        };
        window.localStorage.setItem(key, JSON.stringify(wrapped));
      } else {
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
      }
      cache.set(key, defaultValue);
    }
  }, [key, defaultValue]);

  const onSubscribe = (onStoreChange: () => unknown) => {
    const onChange = (cacheKey: string) => {
      if (cacheKey === key) {
        onStoreChange();
      }
    };
    handlers.add(onChange);
    return () => {
      handlers.delete(onChange);
    };
  };

  const onSnapshot = () => {
    return cache.get(key) as T | undefined;
  };

  const state = useSyncExternalStore(onSubscribe, onSnapshot);
  const setState = (newValue: T) => {
    cache.set(key, newValue);
    if (isPrimitive(newValue)) {
      const wrapped = { [IS_PRIMITIVE]: true, [key]: newValue };
      window.localStorage.setItem(key, JSON.stringify(wrapped));
    } else {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    }

    for (const handler of handlers) {
      handler(key);
    }
  };

  const deleteState = () => {
    cache.delete(key);
    window.localStorage.removeItem(key);

    for (const handler of handlers) {
      handler(key);
    }
  };

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) {
        for (const handler of handlers) {
          handler(key);
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);

  return { state, setState, deleteState };
};

export default useLocalStorage;
