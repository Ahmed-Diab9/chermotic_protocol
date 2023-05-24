import { errorLog } from "./log";

export const filterIfFulfilled = async <T>(
  asyncTasks: Promise<T>[],
  hasError: boolean = false
) => {
  const array = [] as T[];
  const promise = await Promise.allSettled(asyncTasks);
  const promiseLength = promise.length;

  for (let index = 0; index < promiseLength; index++) {
    const element = promise[index];
    if (element.status === "fulfilled") {
      array.push(element.value);
    } else {
      errorLog(element.reason);
    }
  }

  if (array.length !== promiseLength && hasError) {
    errorLog("some elements are rejected");
  }

  return array;
};
