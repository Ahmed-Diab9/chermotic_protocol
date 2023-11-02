export async function PromiseOnlySuccess<T>(values: Iterable<T | PromiseLike<T>>) {
  const result = await Promise.allSettled(values);
  return (
    result
      .filter((v): v is PromiseFulfilledResult<Awaited<T>> => v.status === 'fulfilled')
      .map(({ value }) => value) || ([] as T[])
  );
}

export async function promiseSlowLoop<A extends unknown[] | readonly unknown[], R extends unknown>(
  array: A,
  callback: (item: A[number], index: number) => Promise<R> | R,
  config?: { interval?: number; hasCatch?: boolean }
) {
  const { interval = 1000, hasCatch = false } = config ?? {};
  const newArray = [] as R[];
  for (let index = 0; index < array.length; index++) {
    const item = array[index] as A[number];

    try {
      const awaited = await callback(item, index);
      newArray.push(awaited);
    } catch (error) {
      if (hasCatch) {
        console.error(error);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return newArray;
}
