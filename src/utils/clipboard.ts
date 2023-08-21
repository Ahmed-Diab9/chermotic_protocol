import { toast } from 'react-toastify';
import { errorLog } from './log';

export const copyText = async (text: string) => {
  try {
    await window.navigator.clipboard.writeText(text);
    toast('Address copied.');

    return true;
  } catch (error) {
    errorLog(error);
    return false;
  }
};
