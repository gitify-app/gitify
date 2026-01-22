import type { ExecutionResult } from 'graphql';

/**
 * GitHub GraphQL API response type with HTTP response headers
 */
export type GitHubGraphQLResponse<TResult> = ExecutionResult<TResult> & {
  headers: Record<string, string>;
};

export type FragmentInfo = {
  name: string;
  typeCondition: string;
  printed: string;
  inner: string;
};

export type VariableDef = {
  name: string;
  type: string;
};
