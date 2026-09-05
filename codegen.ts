import type { CodegenConfig } from '@graphql-codegen/cli';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GITHUB_TOKEN) {
  // oxlint-disable-next-line no-console -- CLI script output
  console.warn(
    '\x1b[33m⚠ GITHUB_TOKEN is not set. Skipping GraphQL codegen.\n' +
      '  To generate updated types, create a .env file with a valid GitHub PAT.\n' +
      '  See .env.template for details.\x1b[0m',
  );
  process.exit(0);
}

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    'https://api.github.com/graphql': {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        // Issue fields are exposed behind this feature flag header; without it
        // the schema omits `issueFieldValues` and its union types.
        'GraphQL-Features': 'issue_fields',
      },
      // GitHub's live schema currently fails graphql-js's stricter
      // interface-deprecation-consistency validation (added in graphql v17).
      // Skip validation so introspection can still succeed.
      assumeValid: true,
    },
  },
  documents: ['src/renderer/utils/forges/github/**/*.graphql'],
  generates: {
    'src/renderer/utils/forges/github/graphql/generated/graphql.ts': {
      plugins: ['typescript-operations', 'typed-document-node'],
      config: {
        documentMode: 'string',
        // enumType: 'native',
        scalars: {
          DateTime: 'string',
          URI: '../../../../../types#Link',
        },
        useTypeImports: true,
      },
    },
  },
};

export default config;
