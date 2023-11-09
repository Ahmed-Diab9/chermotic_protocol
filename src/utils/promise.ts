export async function PromiseOnlySuccess<T>(values: Iterable<T | PromiseLike<T>>) {
  const result = await Promise.allSettled(values);
  return (
    result
      .filter((v): v is PromiseFulfilledResult<Awaited<T>> => v.status === 'fulfilled')
      .map(({ value }) => value) || ([] as T[])
  );
}

async function wait(interval = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null!);
    }, interval);
  });
}

export async function promiseSlowLoop<A extends unknown[] | readonly unknown[], R extends unknown>(
  array: A,
  callback: (item: A[number], index: number) => Promise<R> | R,
  config?: { interval?: number; hasCatch?: boolean }
) {
  const { interval = 1000, hasCatch = false } = config ?? {};
  const response = await Promise.allSettled(
    array.map(async (item, index) => {
      await wait(interval * index);
      return callback(item, index);
    })
  );
  if (hasCatch) {
    const rejecteds = response.filter(({ status }) => status === 'rejected');
    console.error(rejecteds, 'rejecteds');
  }
  return response
    .filter((value): value is PromiseFulfilledResult<Awaited<R>> => value.status === 'fulfilled')
    .map(({ value }) => value);
}
