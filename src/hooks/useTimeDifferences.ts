export const useTimeDifferences = () => {
  const offset = new Date().getTimezoneOffset();

  const hours = Math.abs(Math.floor(offset / 60));
  const minutes = Math.abs(offset % 60);
  const unit = offset < 0 ? 'am' : 'pm';

  return { hours, minutes, unit };
};
