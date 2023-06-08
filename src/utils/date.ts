export const createCurrentDate = () => {
  const date = new Date();
  const formatted = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

  return formatted;
};
