import { isNotNil } from 'ramda';
import { useEffect } from 'react';
import { Logger } from '~/utils/log';

const defaultLogger = Logger('Error');

interface Props {
  error: unknown | unknown[];
  logger?: {
    error: (...args: any) => unknown;
  };
}
export function useError({ error, logger }: Props) {
  useEffect(() => {
    if (error) {
      if (error instanceof Array) {
        error.filter((err) => isNotNil(err)).forEach((err) => (logger ?? defaultLogger).error(err));
      } else {
        (logger ?? defaultLogger).error(error);
      }
    }
  }, [error, logger]);
}
