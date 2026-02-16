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
  documents: ['src/renderer/utils/api/**/*.graphql'],
  generates: {
    'src/renderer/utils/api/graphql/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        onlyOperationTypes: true,
        documentMode: 'string',
        useTypeImports: true,
        enumsAsTypes: true,
        skipTypename: true,
        fragmentMasking: false, // Disables masking
      },
    },
  },
};

export default config;
