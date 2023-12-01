export const createCurrentDate = () => {
  const date = new Date();
  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

  return formatted;
};

const formatDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
}).format;
const formatTime = new Intl.DateTimeFormat('en-US', {
  second: '2-digit',
  minute: '2-digit',
  hour: '2-digit',
  hour12: false,
}).format;
export const formatTimestamp = (timestamp: bigint) => {
  return (
    formatDate(new Date(Number(timestamp) * 1000)) +
    ' ' +
    formatTime(new Date(Number(timestamp) * 1000))
  );
};
