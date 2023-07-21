export const isValid = <T extends unknown>(value: T): value is NonNullable<T> => {
  if (value === null || value === undefined) {
    return false;
  }
  return true;
};

export const isPrimitive = (value: unknown) => {
  switch (typeof value) {
    case 'number':
    case 'string':
    case 'boolean':
      return true;
    default:
      return false;
  }
};
