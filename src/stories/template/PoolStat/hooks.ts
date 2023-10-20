import { useAppSelector } from '~/store';
import { formatDecimals, mulPreserved } from '~/utils/number';

export const usePoolStat = () => {
  const selectedLp = useAppSelector((state) => state.lp.selectedLp);
  const aum = selectedLp
    ? formatDecimals(selectedLp.totalValue, selectedLp.settlementToken.decimals, 3, true) +
      ' ' +
      selectedLp.settlementToken.name
    : '';
  const clpSupply = formatDecimals(selectedLp?.totalSupply, selectedLp?.decimals, 3, true) + ' CLP';
  const utilization = formatDecimals(selectedLp?.utilization, 2, 2, false) + ' %';
  const utilizedValue = selectedLp
    ? formatDecimals(
        mulPreserved(selectedLp.totalValue, BigInt(selectedLp.utilization), 4),
        selectedLp.settlementToken.decimals,
        2,
        true
      ) +
      ' ' +
      selectedLp.settlementToken.name
    : undefined;
  const progressRate = selectedLp ? selectedLp.utilization / 100 : 0;
  const tokenImage = selectedLp?.settlementToken.image;
  const clpImage = selectedLp?.image;
  return {
    aum,
    clpSupply,
    utilization,
    utilizedValue,
    progressRate,
    tokenImage,
    clpImage,
  };
};
