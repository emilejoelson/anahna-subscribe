import { useConfiguration } from '@/lib/hooks/useConfiguration';
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  split,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { onError } from '@apollo/client/link/error';
import { APP_NAME } from '../utils/constants';

export const useSetupApollo = (): ApolloClient<NormalizedCacheObject> => {
  const { SERVER_URL, WS_SERVER_URL } = useConfiguration();

  const httpLink = new HttpLink({
    uri: `${SERVER_URL}graphql`,
  });

  const authMiddleware = new ApolloLink((operation, forward) => {
    const data = localStorage.getItem(`user-${APP_NAME}`);
    let token = '';
    if (data) {
      token = JSON.parse(data).token;
    }

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    }));

    return forward(operation);
  });

  const errorLink = onError(({ networkError, graphQLErrors }) => {
    if (networkError) {
      console.error('Network Error:', networkError);
    }

    if (graphQLErrors) {
      graphQLErrors.forEach((error) =>
        console.error('GraphQL Error:', error.message)
      );
    }
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: `${WS_SERVER_URL}graphql`,
      connectionParams: () => {
        const data = localStorage.getItem(`user-${APP_NAME}`);
        let token = '';
        if (data) {
          token = JSON.parse(data).token;
        }

        return {
          authorization: token ? `Bearer ${token}` : '',
        };
      },
      retryAttempts: 5,
      shouldRetry: () => true,
    })
  );

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    ApolloLink.from([authMiddleware, httpLink])
  );

  const client = new ApolloClient({
    link: ApolloLink.from([errorLink, splitLink]),
    cache: new InMemoryCache(),
    connectToDevTools: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  });

  return client;
};
