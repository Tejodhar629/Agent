"use client";

import React, { useMemo } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useAuth } from './AuthProvider';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();

  // Create an Apollo Client instance dynamically memoized with the current JWT token
  const client = useMemo(() => {
    const httpLink = createHttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || 'http://localhost:4000/graphql', 
    });

    const authLink = setContext((_, { headers }) => {
      // Attach the JWT token from the AuthContext to the Authorization header
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
        }
      };
    });

    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
        },
      },
    });
  }, [token]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
