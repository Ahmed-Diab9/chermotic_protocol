import useSWR, { KeyedMutator } from 'swr';

function useSharedState<T>(key: string, initial?: T): [T | undefined, KeyedMutator<T>] {
  const { data: state, mutate: setState } = useSWR<T, any>(key, { fallbackData: initial });

  return [state, setState];
}

export default useSharedState;
