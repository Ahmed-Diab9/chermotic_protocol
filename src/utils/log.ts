import debug from 'debug';
export function Logger(nameOrFunction?: string | Function) {
  let namespace = nameOrFunction;
  if (nameOrFunction instanceof Function) {
    namespace = nameOrFunction.name;
  }
  const log = debug(`${namespace || ''}`);
  const error = debug(`${namespace || ''}:error`);
  return {
    log,
    info: log,
    error: (...args: any) => {
      console.error(...args);
      error.apply(Logger, [args]);
    },
  };
}
const logger = Logger();
export const errorLog = (...args: any) => {
  logger.error.apply(logger, args);
};

export const infoLog = (...args: any) => {
  logger.info.apply(logger, args);
};
