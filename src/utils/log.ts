export const infoLog = (...args: any[]) => {
  if (!import.meta.env.PROD) {
    console.log(...args);
  }
};

export const errorLog = (...args: any[]) => {
  if (!import.meta.env.PROD) {
    console.error(...args);
  }
};

export const traceLog = (...args: any[]) => {
  if (!import.meta.env.PROD) {
    console.error("IGNORE :::", ...args);
  }
};
