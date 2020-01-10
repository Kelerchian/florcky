import test from "ava";
import { forkJob } from "./forkJob";

test("Forked job has setMaxJob and getMaxJob", (t) => {
  const forkedJob = forkJob(() => Promise.resolve());

  forkedJob.setMaxJob(3);
  t.is(forkedJob.getMaxJob(), 3);
  forkedJob.setMaxJob(4);
  t.is(forkedJob.getMaxJob(), 4);
});

test("Forked job has default job count 1", (t) => {
  const forkedJob = forkJob(() => Promise.resolve());
  t.is(forkedJob.getMaxJob(), 1);
});

test("Forked job can only be invoked by the designated max job", (t) => {
  const maxJobCount = 3;
  const array: boolean[] = [];
  const promiseResolverArray: Function[] = [];
  const job = () =>
    new Promise((resolve) => {
      array.push(true);
      promiseResolverArray.push(resolve);
    });
  const forkedJob = forkJob(job).setMaxJob(maxJobCount);

  t.truthy(forkedJob.run());
  t.truthy(forkedJob.run());
  t.truthy(forkedJob.run());
  t.is(forkedJob.run(), null);
  t.is(forkedJob.run(), null);
  t.is(forkedJob.run(), null);
  t.is(forkedJob.run(), null);
  t.is(forkedJob.run(), null);

  promiseResolverArray.forEach((res) => res());
  t.is(array.length, maxJobCount);
});

test("getActiveJobCount return the number of promise unresolved in the forked job", async (t) => {
  const maxJobCount = 3;
  const array: boolean[] = [];
  const jobAwaiter: (Promise<any> | null)[] = [];
  const promiseResolverArray: Function[] = [];
  const job = () =>
    new Promise((resolve) => {
      array.push(true);
      promiseResolverArray.push(resolve);
    });
  const forkedJob = forkJob(job).setMaxJob(maxJobCount);

  t.is(forkedJob.getActiveJobCount(), 0);
  jobAwaiter.push(forkedJob.run());
  t.is(forkedJob.getActiveJobCount(), 1);
  jobAwaiter.push(forkedJob.run());
  t.is(forkedJob.getActiveJobCount(), 2);
  jobAwaiter.push(forkedJob.run());
  t.is(forkedJob.getActiveJobCount(), 3);
  jobAwaiter.push(forkedJob.run());
  t.is(forkedJob.getActiveJobCount(), 3);
  jobAwaiter.push(forkedJob.run());
  t.is(forkedJob.getActiveJobCount(), 3);
  jobAwaiter.push(forkedJob.run());
  t.is(forkedJob.getActiveJobCount(), 3);
  jobAwaiter.push(forkedJob.run());
  t.is(forkedJob.getActiveJobCount(), 3);
  jobAwaiter.push(forkedJob.run());
  t.is(forkedJob.getActiveJobCount(), 3);

  promiseResolverArray.forEach((res) => res());
  await Promise.all(jobAwaiter);

  t.is(forkedJob.getActiveJobCount(), 0);
});
