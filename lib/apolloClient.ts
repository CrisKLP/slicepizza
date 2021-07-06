import {
  ApolloClient,
  ApolloLink,
  from,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { parseCookies } from 'nookies';
import { useMemo } from 'react';

let globalApolloClient: ApolloClient<NormalizedCacheObject>;

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_ENDPOINT,
  credentials: 'same-origin',
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError)
    console.log(
      `[Network error]: ${networkError}. Backend is unreachable. Is it running?`
    );
});

const authMiddleware = (token?: string) =>
  new ApolloLink((operation, forward) => {
    if (token) {
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          authorization: `Bearer ${token}`,
        },
      }));
    }

    return forward(operation);
  });

const createApolloClient = (token?: string) => {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([errorLink, authMiddleware(token), httpLink]),
    cache: new InMemoryCache(),
  });
};

export const initializeApollo = (
  initialState?: NormalizedCacheObject,
  token?: string
) => {
  const apolloClient = globalApolloClient ?? createApolloClient(token);

  if (initialState) {
    const existingCache = apolloClient.extract();

    apolloClient.cache.restore({ ...existingCache, ...initialState });
  }
  if (typeof window === 'undefined') return apolloClient;

  if (!globalApolloClient) globalApolloClient = apolloClient;

  return apolloClient;
};

export const useApollo = (initialState: NormalizedCacheObject) => {
  const token = parseCookies().jwt;

  const store = useMemo(
    () => initializeApollo(initialState, token),
    [initialState, token]
  );
  return store;
};
