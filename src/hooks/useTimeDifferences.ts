export const useTimeDifferences = () => {
  const offset = new Date().getTimezoneOffset();

  const hours = Math.abs(Math.floor(offset / 60)).toString();
  const minutes = Math.abs(offset % 60).toString();
  const unit = offset < 0 ? 'am' : 'pm';
  const prefix = offset < 0 ? '+' : '-';

  return { hours, minutes, unit, prefix };
};
