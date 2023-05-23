import { errorLog } from "./log";

export const filterIfFulfilled = <T>(
  promise: PromiseSettledResult<T>[],
  hasError: boolean = false
) => {
  const array = [] as T[];

  const filtered = promise.filter(
    (result): result is PromiseFulfilledResult<T> => {
      return result.status === "fulfilled";
    }
  );

  if (promise.length !== filtered.length && hasError) {
    errorLog("some elements are rejected");
  }

  for (let index = 0; index < filtered.length; index++) {
    array.push(filtered[index].value);
  }

  return array;
};
