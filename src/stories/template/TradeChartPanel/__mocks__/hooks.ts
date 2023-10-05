import useLocalStorage from '~/hooks/useLocalStorage';

export function useTradeChartPanel() {
  const { state: darkMode } = useLocalStorage('app:useDarkMode', false);

  return {
    darkMode,
    symbol: 'ETHUSD',
  };
}
