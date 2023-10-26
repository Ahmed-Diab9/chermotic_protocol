import axios from 'axios';
import { CHRM } from '~/configs/token';
import { CMC_API } from '~/constants/coinmarketcap';
import { CMCTokenInfo } from '~/typings/api';
import BTC_LOGO from '../assets/tokens/BTC.png';
import CHRM_LOGO from '../assets/tokens/CHRM.png';
import CTST_LOGO from '../assets/tokens/CTST.png';
import ETH_LOGO from '../assets/tokens/ETH.png';
import USDC_LOGO from '../assets/tokens/USDC.png';
import WETH_LOGO from '../assets/tokens/WETH.png';

const localLogos = {
  BTC: BTC_LOGO,
  ETH: ETH_LOGO,
  WETH: WETH_LOGO,
  USDC: USDC_LOGO,
  CHRM: CHRM_LOGO,
  cTST: CTST_LOGO,
};

export const fetchTokenInfo = async (symbols: string | string[]) => {
  if (symbols instanceof Array && symbols.length === 0) {
    return {};
  }
  const symbolString = typeof symbols === 'string' ? symbols : symbols.toString();
  const { data } = await axios({
    method: 'GET',
    url: `${CMC_API}/${symbolString}`,
  });
  if (!data.data) {
    throw new Error(data.status.error_message, data.status);
  }
  return data.data as Record<string, CMCTokenInfo[]>;
};

export const fetchTokenImages = async (symbols: string[], useApi = false) => {
  if (!useApi) {
    return localLogos as Record<string, string>;
  }
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
