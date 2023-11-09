import { GraphQLClient, RequestMiddleware, Variables } from '@chromatic-protocol/graphql-request';
import { HASURA_API_URL, SUBGRAPH_API_URL } from '~/configs/subgraph';

import * as Lp from '~/lib/graphql/sdk/lp';
import * as Performance from '~/lib/graphql/sdk/performance';

type UrlMap = {
  operations: string[];
  url: string;
}[];

function getOperations(object: Object) {
  const documentSuffix = 'Document';
  return Object.keys(object)
    .filter((k) => k.endsWith(documentSuffix))
    .map((k) => k.slice(0, -documentSuffix.length));
}

const urlMap: UrlMap = [
  {
    operations: getOperations(Lp),
    url: `${SUBGRAPH_API_URL}/chromatic-lp`,
  },
  {
    operations: getOperations(Performance),
    url: `${HASURA_API_URL}`,
  },
];

const getRequestMiddleware =
  (urlMap: UrlMap): RequestMiddleware<Variables> =>
  (request) => {
    const url = urlMap.find((url) => url.operations.includes(request.operationName!))?.url;
    if (!url) {
      throw new Error('invalid operation');
    }
    return {
      ...request,
      url,
    };
  };

const graphClient = new GraphQLClient('', {
  requestMiddleware: getRequestMiddleware(urlMap),
});

const lpGraphSdk = Lp.getSdk(graphClient);
const performanceSdk = Performance.getSdk(graphClient);

export { lpGraphSdk, performanceSdk };
