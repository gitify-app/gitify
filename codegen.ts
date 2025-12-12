import type { CodegenConfig } from '@graphql-codegen/cli';
import dotenv from 'dotenv';

dotenv.config();

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    'https://api.github.com/graphql': {
      // Add a custom header for authorization using your PAT
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    },
  },
  documents: [
    'src/renderer/utils/api/**/*.ts',
    '!src/renderer/utils/api/graphql/generated/**',
    '!src/renderer/utils/api/**/*.test.ts',
  ],
  generates: {
    'src/renderer/utils/api/graphql/generated/': {
      preset: 'client',
      config: {
        documentMode: 'string',
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
