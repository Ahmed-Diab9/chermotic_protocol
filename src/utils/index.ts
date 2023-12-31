import { isEmpty, isNil, isNotNil } from 'ramda';

type NonNullableProperties<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

export function checkAllProps<T extends object>(obj: T): obj is NonNullableProperties<T> {
  const keys = Object.keys(obj) as (keyof T)[];
  return keys.every((key) => !isNilOrEmpty(obj[key]));
}

export function isNilOrEmpty<T>(value: T) {
  return isNil(value) || isEmpty(value);
}
