import type { CodegenConfig } from '@graphql-codegen/cli';
import dotenv from 'dotenv';

dotenv.config();

const config: CodegenConfig = {
  overwrite: true,
  // Point the schema field to the GitHub GraphQL API endpoint
  schema: {
    'https://api.github.com/graphql': {
      // Add a custom header for authorization using your PAT
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'GraphQL-Codegen-GitHub-Integration', // GitHub recommends a User-Agent header
      },
    },
  },
  // Define where your application's GraphQL queries/mutations are located
  // documents: 'src/**/*.graphql',
  documents: [
    'src/renderer/utils/api/**/*.ts',
    '!src/renderer/utils/api/graphql/generated/**',
    '!src/renderer/utils/api/**/*.test.ts',
  ],
  // Configure generated outputs and plugins
  generates: {
    'src/renderer/utils/api/graphql/generated/': {
      preset: 'client', // Or use specific plugins like 'typescript', 'typescript-operations'
      plugins: [],
      config: {
        documentMode: 'string',

        // Additional plugin configuration, e.g. for scalars
        // scalars: {
        //   DateTime: 'string',
        //   URI: 'string',
        //   GitTimestamp: 'string',
        //   Html: 'string',
        //   X509Certificate: 'string',
        // },
      },
    },
    'src/renderer/utils/api/graphql/generated/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
};

export default config;
