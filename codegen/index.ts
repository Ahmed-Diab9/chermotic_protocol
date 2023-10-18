import type { CodegenConfig } from '@graphql-codegen/cli';

import { SUBGRAPH_API_URL } from '../src/configs/subgraph';

const GENERATED_PATH = 'src/lib/graphql/sdk';

const config: CodegenConfig = {
  overwrite: true,
  noSilentErrors: true,
  generates: {
    [`${GENERATED_PATH}/lp.ts`]: {
      documents: 'codegen/lp.ts',
      schema: `${SUBGRAPH_API_URL}/chromatic-lp`,
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
    [`${GENERATED_PATH}/pricefeed.ts`]: {
      documents: 'codegen/pricefeed.ts',
      schema: `${SUBGRAPH_API_URL}/chainlink-pricefeed`,
      plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        scalars: {
          BigInt: {
            input: 'string',
            output: 'string',
          },
        },
      },
    },
  },
};

export default config;
