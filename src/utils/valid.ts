export const isValid = <T extends unknown>(
  value: T
): value is NonNullable<T> => {
  if (value === null || value === undefined) {
    return false;
  }
  return true;
};
