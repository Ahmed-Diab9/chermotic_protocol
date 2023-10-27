import type { CodegenConfig } from '@graphql-codegen/cli';

import { HASURA_API_URL, SUBGRAPH_API_URL } from '../src/configs/subgraph';

const GENERATED_PATH = 'src/lib/graphql/sdk';

const PLUGINS = ['typescript', 'typescript-operations', 'typescript-graphql-request'];

const CONFIG = {
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
};

const config: CodegenConfig = {
  overwrite: true,
  noSilentErrors: true,
  generates: {
    [`${GENERATED_PATH}/lp.ts`]: {
      documents: 'codegen/lp.ts',
      schema: `https://${SUBGRAPH_API_URL}/chromatic-lp`,
      plugins: PLUGINS,
      config: CONFIG,
    },
    [`${GENERATED_PATH}/pricefeed.ts`]: {
      documents: 'codegen/pricefeed.ts',
      schema: `https://${SUBGRAPH_API_URL}/chainlink-pricefeed`,
      plugins: PLUGINS,
      config: CONFIG,
    },
    [`${GENERATED_PATH}/hasura.ts`]: {
      documents: 'codegen/hasura.ts',
      schema: `https://${HASURA_API_URL}`,
      plugins: PLUGINS,
      config: CONFIG,
    },
    [`${GENERATED_PATH}/pricefeed_ws.ts`]: {
      documents: 'codegen/pricefeed.ts',
      schema: `https://${SUBGRAPH_API_URL}/chainlink-pricefeed`,
      plugins: PLUGINS,
      config: {
        ...CONFIG,
        useWebSocketClient: true,
      },
    },
  },
};

export default config;
