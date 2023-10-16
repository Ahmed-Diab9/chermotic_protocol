import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { ReactNode } from 'react';

const apolloClient = new ApolloClient({
  uri: 'https://graph-arbitrum-goerli.api.chromatic.finance/subgraphs/name/chromatic-lp',
  cache: new InMemoryCache(),
});

export function ApolloClientProvider({ children }: { children: ReactNode }): JSX.Element {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
