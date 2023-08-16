export function hiddenArgs(args: string[]) {
  return args.reduce(
    (acc, arg) => {
      acc[arg] = {
        table: {
          disable: true,
        },
      };
      return acc;
    },
    {} as {
      [arg: string]: {
        table: {
          disable: true;
        };
      };
    }
  );
}

export function disabledArgs(args: string[]) {
  return args.reduce(
    (acc, arg) => {
      acc[arg] = {
        control: {
          type: null,
        },
      };
      return acc;
    },
    {} as {
      [arg: string]: {
        control: {
          type: null;
        };
      };
    }
  );
}
