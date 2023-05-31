export class AppError extends Error {
  sources?: string[];
  constructor(message: any, sources?: string[]) {
    super();

    this.message = message;
    this.sources = sources;
  }

  static fatal(message: any, ...sources: string[]) {
    return new AppError(message, sources);
  }

  static reject(message: any, ...sources: string[]) {
    return Promise.reject(AppError.fatal(message, ...sources));
  }

  static is(error: unknown): error is AppError {
    return error instanceof AppError;
  }
}
