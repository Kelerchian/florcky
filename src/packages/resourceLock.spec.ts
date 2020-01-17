import test from "ava";
import { MapResourceLock } from "./resourceLock";

test("MapResourceLock should only run operation and lock the given resource for the given id if is not locked", async (t) => {
  const resourceLock = new MapResourceLock<string>();
  const id = "id";
  const resource = "somestring";

  let lockCount = 0;
  let unlockCount = 0;
  let callCount = 0;
  let resolveFunction: any;

  const operation = () =>
    new Promise((resolve) => {
      callCount++;
      resolveFunction = resolve;
    });

  resourceLock.events.subscribe("locked", () => lockCount++);
  resourceLock.events.subscribe("unlocked", () => unlockCount++);
  const promise = resourceLock.run(id, resource, operation);

  t.is(null, resourceLock.run(id, resource, operation));
  t.is(null, resourceLock.run(id, resource, operation));
  t.is(null, resourceLock.run(id, resource, operation));
  t.is(resourceLock.getLockedResource(id), resource);
  t.is(1, callCount);

  t.is(1, lockCount);
  t.is(0, unlockCount);

  resolveFunction();
  await promise;

  t.is(1, lockCount);
  t.is(1, unlockCount);
});
