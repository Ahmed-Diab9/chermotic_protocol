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
  const settleds = await Promise.allSettled(promises);

  return settleds.map((settled) => {
    if (settled.status === 'rejected') {
      return undefined;
    }
    return settled.value;
  });
}
