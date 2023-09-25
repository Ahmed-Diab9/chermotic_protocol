import axios from 'axios';
import { CHRM } from '~/configs/token';
import { CMC_API } from '~/constants/coinmarketcap';
import { CMCTokenInfo } from '~/typings/api';
import CHRM_LOGO from '../assets/tokens/CHRM.png';

export const fetchTokenInfo = async (symbols: string | string[]) => {
  const symbolString = typeof symbols === 'string' ? symbols : symbols.toString();
  console.log(symbolString, 'symbol string');
  const { data } = await axios({
    method: 'GET',
    url: `${CMC_API}/${symbolString}`,
  });
  if (!data.data) {
    throw new Error(data.status.error_message, data.status);
  }
  return data.data as Record<string, CMCTokenInfo[]>;
};

export const fetchTokenImages = async (symbols: string[]) => {
  const filteredSymbols = symbols.filter((symbol) => symbol !== CHRM);
  const tokenInfo = await fetchTokenInfo(filteredSymbols);
  const imageMap = Object.entries(tokenInfo).reduce((imageMap, [symbol, info]) => {
    if (info.length >= 1) {
      imageMap[symbol] = info[0].logo;
    }
    return imageMap;
  }, {} as Record<string, string>);
  imageMap[CHRM] = CHRM_LOGO;
  return imageMap;
};
