export const useTimeDifferences = () => {
  const offset = new Date().getTimezoneOffset();

  const unit = offset <= 0 ? 'am' : 'pm';
  const prefix = offset <= 0 ? '+' : '-';
  const hours = Math.abs(Math.floor(offset / 60));
  let formattedHours = hours;
  if (prefix === '-') {
    formattedHours = 12 - hours;
  }

  const minutes = Math.abs(offset % 60);
  if (minutes !== 0 && prefix === '-') {
    formattedHours = formattedHours - 1;
  }

  const formattedMinutes = minutes.toString().padStart(2, '0');

  return {
    hours,
    minutes,
    unit,
    prefix,
    formatted: {
      hours: formattedHours.toString().padStart(2, '0'),
      minutes: formattedMinutes,
    },
  };
};
