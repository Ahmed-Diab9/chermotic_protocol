export {};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// TODO: check potential issues
BigInt.prototype.toJSON = function () {
  return this.toString() + 'n';
};
