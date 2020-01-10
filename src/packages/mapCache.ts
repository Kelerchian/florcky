import { TypedEvent } from "./events";

export type CacheItem<T> = {
  expireAt: number;
  data: T;
};
export type CacheOptions = {
  expiry: number;
};
export const makeMapCache = <T>(options: Partial<CacheOptions> = {}) => {
  const appliedOptions: CacheOptions = { ...{ expiry: 3000 }, ...options };
  const map: Map<string, CacheItem<T>> = new Map();
  const events = new TypedEvent<{
    set: { id: string; data: T; expireAt: number };
    delete: { id: string };
  }>();
  const fetchMap = new Map<string, Promise<T | null>>();

  const fetch = (
    id: string,
    fallBack: () => Promise<T | null>
  ): Promise<T | null> => {
    const currentFetch = fetchMap.get(id);
    if (currentFetch) {
      return currentFetch;
    }

    const promise = fallBack().then((result) => {
      if (result) {
        set(id, result);
      }
      return result;
    });
    fetchMap.set(id, promise);
    promise.finally(() => fetchMap.delete(id));
    return promise;
  };

  const get = async (
    id: string,
    fallBack: () => Promise<T | null>
  ): Promise<T | null> => {
    const item = map.get(id);
    if (item) {
      if (isExpired(id)) {
        fetch(id, fallBack);
      }
      return item.data;
    }

    return await fetch(id, fallBack);
  };

  const getImmediate = (id: string): T | null => {
    const item = map.get(id);
    if (!item) return null;

    return item.data;
  };

  const set = (id: string, data: T, expireAtOpt?: number) => {
    const expireAt =
      expireAtOpt || new Date().getTime() + appliedOptions.expiry;
    map.set(id, {
      expireAt,
      data,
    });
    events.emit("set", { id, data, expireAt });
  };

  const isExpired = (id: string, now = new Date().getTime()): boolean => {
    const item = map.get(id);
    if (!item) return false;
    return item.expireAt < now;
  };

  const remove = (id: string) => {
    map.delete(id);
    events.emit("delete", { id });
  };

  const removeExpired = (id: string, now = new Date().getTime()) => {
    if (!isExpired(id, now)) return;
    remove(id);
  };

  const clean = () => {
    const now = new Date().getTime();
    Array.from(map.entries()).forEach(([id]) => removeExpired(id, now));
  };

  return {
    events,
    fetch,
    get,
    getImmediate,
    set,
    isExpired,
    remove,
    removeExpired,
    clean,

    // The map is mutable
    // Use carefully
    getCacheMap: () => map,
  };
};
