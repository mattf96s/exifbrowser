/**
 * [Source](https://github.com/stophecom/sharrr-svelte/blob/0a4ad8ad0d9cc97b9f5978a4b0019f3ba4ed4185/src/lib/api.ts#L31C1-L53C2)
 * @param concurrency
 * @param iterable
 * @param iteratorFn
 * @returns
 */
export const asyncPool = async <T>(
  concurrency: number,
  iterable: number[],
  iteratorFn: (x: number, y: number[]) => T
) => {
  const ret = []; // Store all asynchronous tasks
  const executing = new Set(); // Stores executing asynchronous tasks
  for (const item of iterable) {
    // Call the iteratorFn function to create an asynchronous task
    const p = Promise.resolve().then(() => iteratorFn(item, iterable));

    ret.push(p); // save new async task
    executing.add(p); // Save an executing asynchronous task

    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);
    if (executing.size >= concurrency) {
      // Wait for faster task execution to complete
      await Promise.race(executing);
    }
  }
  return Promise.all(ret);
};
