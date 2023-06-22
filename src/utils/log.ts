import debug from "debug";
export function Logger(nameOrFunction?: string | Function) {
  let namespace = nameOrFunction;
  if (nameOrFunction instanceof Function) {
    namespace = nameOrFunction.name;
  }
  const log = debug(`${namespace || ""}`);
  const error = debug(`${namespace || ""}:error`);
  return {
    log,
    info: log,
    error,
  };
}
const logger = Logger();
export const errorLog = (...args: any[]) => {
  logger.error.call(this, args);
};

export const infoLog = (...args: any[]) => {
  logger.info.call(this, args);
};
// export const infoLog = (...args: any[]) => {
//   if (!import.meta.env.PROD) {
//     console.log(...args);
//   }
// };

// export const errorLog = (...args: any[]) => {
//   if (!import.meta.env.PROD) {
//     console.error(...args);
//   }
// };

// export const traceLog = (...args: any[]) => {
//   if (!import.meta.env.PROD) {
//     console.error("IGNORE :::", ...args);
//   }
// };
