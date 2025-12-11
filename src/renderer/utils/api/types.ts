/**
 * The response from a GitHub GraphQL API request.
 */
export interface GitHubGraphQLResponse<TData> {
  data: TData;
  errors?: GitHubGraphQLError[];
}

interface GitHubGraphQLError {
  message: string;
}
