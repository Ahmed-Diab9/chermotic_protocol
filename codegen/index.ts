import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://graph-arbitrum-goerli.api.chromatic.finance/subgraphs/name/chromatic-lp',
  noSilentErrors: true,
  documents: 'codegen/**/*.ts',
  generates: {
    'src/__generated__/request.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        scalars: {
          Bytes: {
            input: '`0x${string}`',
            output: '`0x${string}`',
          },
          BigInt: {
            input: 'string',
            output: 'string',
          },
        },
      },
    },
    './graphql.schema.json': {
      plugins: ['introspection'],
    },
  },
};

export default config;
