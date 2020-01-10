import test from "ava";
import { makeMapCache } from "./mapCache";

test("mapCache.fetch should call fetch function", async (t) => {
  let fetchCalled = false;
  const mapCache = makeMapCache<unknown>();
  const fetchFunction = async () => {
    fetchCalled = true;
    return {};
  };

  await mapCache.fetch("", fetchFunction);

  t.is(fetchCalled, true);
});

test("mapCache.fetch should use unresolved promise on multiple fetches for the same id", async (t) => {
  const resolvers: Function[] = [];
  const mapCache = makeMapCache<unknown>();
  const fetchFunction = () =>
    new Promise((resolve) =>
      resolvers.push(() => resolve(Symbol("unique-symbol")))
    );

  const firstFetch = mapCache.get("", fetchFunction);
  const secondFetch = mapCache.get("", fetchFunction);

  resolvers.forEach((resolve) => resolve());

  t.is(await firstFetch, await secondFetch);
});

test("mapCache.get should fetch if cached doesn't exist", async (t) => {
  let fetchCalled = false;
  const mapCache = makeMapCache<unknown>();
  const fetchFunction = async () => {
    fetchCalled = true;
    return {};
  };

  await mapCache.get("", fetchFunction);

  t.is(fetchCalled, true);
});

test("mapCache.get should return cached if exist", async (t) => {
  const mapCache = makeMapCache<unknown>();
  const fetchFunction = async () => {
    return {};
  };

  const first = await mapCache.get("", fetchFunction);
  const second = await mapCache.get("", fetchFunction);

  t.is(first, second);
});

test("mapCache.getImmediate should return cached if exist, otherwise null", async (t) => {
  const mapCache = makeMapCache<unknown>();
  const fetchFunction = async () => {
    return {};
  };

  const shouldBeNull = mapCache.getImmediate("");
  await mapCache.fetch("", fetchFunction);
  const shouldNotBeNull = mapCache.getImmediate("");

  t.is(shouldBeNull, null);
  t.not(shouldNotBeNull, null);
});

test("mapCache.remove should remove cached item", async (t) => {
  const mapCache = makeMapCache<unknown>();
  const fetchFunction = async () => {
    return {};
  };

  await mapCache.fetch("", fetchFunction);
  mapCache.remove("");
  const shouldBeNull = mapCache.getImmediate("");

  t.is(shouldBeNull, null);
});

test("mapCache.removeExpired should remove cached item", async (t) => {
  const mapCache = makeMapCache<boolean>({
    expiry: 10,
  });
  await mapCache.fetch("", async () => true);
  const shouldNotBeNull = mapCache.getImmediate("");
  await new Promise((resolve) => setTimeout(resolve, 12));
  mapCache.removeExpired("");
  const shouldBeNull = mapCache.getImmediate("");

  t.is(shouldBeNull, null);
  t.not(shouldNotBeNull, null);
});

test("mapCache.clean should all remove cached item", async (t) => {
  const mapCache = makeMapCache<boolean>({
    expiry: 10,
  });
  await mapCache.fetch("1", async () => true);
  await mapCache.fetch("2", async () => true);
  await new Promise((resolve) => setTimeout(resolve, 12));
  mapCache.removeExpired("");
  const null1 = mapCache.getImmediate("");
  const null2 = mapCache.getImmediate("");

  t.is(null1, null);
  t.is(null2, null);
});
