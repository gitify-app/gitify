import type { IGraphQLConfig } from 'graphql-config';

const config: IGraphQLConfig = {
  projects: {
    github: {
      schema: './src/renderer/utils/forges/github/graphql/generated/schema.graphql',
      documents: ['src/renderer/utils/forges/github/**/*.graphql'],
    },
    bitbucket: {
      schema: 'https://developer.atlassian.com/gateway/api/graphql',
      documents: ['src/renderer/utils/forges/bitbucket/**/*.graphql'],
    },
  },
};

export default config;
