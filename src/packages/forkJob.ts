/**
 * Receives fn, a function that returns a Promise
 * Returns jobRunner which can be executed multiple times
 * jobRunner will keep track of the running promise and will
 * limit the number of the runnable function
 * jobRunner.run will return promise if jobRunner still has space to run the Promise
 * jobRunner.run will return null if jobRunner's number unresolved promise equals to its maxJob
 * @return jobRunner
 */
export const forkJob = <T>(fn: () => Promise<T>) => {
  const set: Set<Promise<any>> = new Set();
  let maxSize = 1;
  const workerSet = {
    setMaxJob: (size: number) => {
      maxSize = Math.max(1, size);
      return workerSet;
    },
    getMaxJob: () => {
      return maxSize;
    },
    getActiveJobCount: (): number => set.size,
    run: (): Promise<T> | null => {
      if (set.size >= maxSize) return null;
      const job = fn();
      set.add(job);
      job.finally(() => set.delete(job));
      return job;
    },
  };
  return workerSet;
};
