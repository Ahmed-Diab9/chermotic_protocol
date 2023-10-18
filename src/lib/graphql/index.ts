import { GraphQLClient, RequestMiddleware, Variables } from 'graphql-request';
import { SUBGRAPH_API_URL } from '~/configs/subgraph';

import * as Lp from '~/lib/graphql/sdk/lp';
import * as Pricefeed from '~/lib/graphql/sdk/pricefeed';

type PathMap = {
  operations: string[];
  path: string;
}[];

function getOperations(object: Object) {
  return Object.keys(object)
    .filter((k) => k.endsWith('Document'))
    .map((k) => k.slice(0, -'Docuemnt'.length));
}

const pathMap: PathMap = [
  {
    operations: getOperations(Lp),
    path: 'chromatic-lp',
  },
  {
    operations: getOperations(Pricefeed),
    path: 'chainlink-pricefeed',
  },
];

const getRequestMiddleware =
  (pathMap: PathMap): RequestMiddleware<Variables> =>
  (request) => {
    const path = pathMap.find((url) => url.operations.includes(request.operationName!))?.path;
    if (!path) {
      throw new Error('invalid operation');
    }
    return {
      ...request,
      url: `${request.url}/${path}`,
    };
  };

const graphClient = new GraphQLClient(SUBGRAPH_API_URL, {
  requestMiddleware: getRequestMiddleware(pathMap),
});

const lpGraphSdk = Lp.getSdk(graphClient);
const pricefeedGraphSdk = Pricefeed.getSdk(graphClient);

export { lpGraphSdk, pricefeedGraphSdk };
