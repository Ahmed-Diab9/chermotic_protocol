import { useEffect } from 'react';
import { Logger } from '~/utils/log';

const defaultLogger = Logger('Error');

interface Props {
  error: unknown;
  logger?: {
    error: (...args: any) => unknown;
  };
}
export function useError({ error, logger }: Props) {
  useEffect(() => {
    if (error) {
      (logger ?? defaultLogger).error(error);
    }
  }, [error]);
}
