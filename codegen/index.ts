import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://graph-arbitrum-goerli.api.chromatic.finance/subgraphs/name/chromatic-lp',
  documents: 'codegen/**/*.{ts,tsx}',
  generates: {
    'src/__generated__/': {
      preset: 'client',
      plugins: ['typescript', 'typescript-operations'],
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
            input: 'bigint',
            output: 'bigint',
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
