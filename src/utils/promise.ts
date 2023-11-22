export async function PromiseOnlySuccess<T>(values: Iterable<T | PromiseLike<T>>) {
  const result = await Promise.allSettled(values);
  return (
    result
      .filter((v): v is PromiseFulfilledResult<Awaited<T>> => v.status === 'fulfilled')
      .map(({ value }) => value) || ([] as T[])
  );
}

export async function wait(interval = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null!);
    }, interval);
  });
}

export async function promiseIfFulfilled<T>(promises: (Promise<T> | undefined)[]) {
  const settled = await Promise.allSettled(promises);
  let result = [] as (T | undefined)[];
  for (let index = 0; index < settled.length; index++) {
    const promiseElement = settled[index];
    if (promiseElement.status === 'rejected') {
      result = result.concat(undefined);
    } else {
      result = result.concat(promiseElement.value);
    }
  }

  return result;
}
