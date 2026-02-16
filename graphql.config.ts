import type { IGraphQLConfig } from 'graphql-config';

const config: IGraphQLConfig = {
  schema: './src/renderer/utils/api/graphql/generated/schema.graphql',
  documents: ['src/renderer/utils/api/**/*.graphql'],
};

export default config;
