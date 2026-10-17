import type { CodegenConfig } from '@graphql-codegen/cli';
import dotenv from 'dotenv';

dotenv.config();

// The Atlassian GraphQL gateway is public and requires no credentials.
const ATLASSIAN_GRAPHQL_URL = 'https://developer.atlassian.com/gateway/api/graphql';

const generates: CodegenConfig['generates'] = {
  'src/renderer/utils/forges/bitbucket/graphql/generated/graphql.ts': {
    schema: {
      // The public Atlassian schema also fails graphql-js v17's stricter
      // interface-deprecation-consistency validation, so skip validation.
      [ATLASSIAN_GRAPHQL_URL]: { assumeValid: true },
    },
    documents: ['src/renderer/utils/forges/bitbucket/**/*.graphql'],
    plugins: ['typescript-operations', 'typed-document-node'],
    config: {
      documentMode: 'string',
      enumType: 'native',
      defaultScalarType: 'string',
      useTypeImports: true,
      // The public gateway schema diverges from the runtime Atlassian schema
      // (for example `notificationFeed` lacks the `flat` argument), so document
      // validation against it is skipped. See setchy/atlassify for the same workaround.
      skipDocumentsValidation: true,
    },
  },
};

if (process.env.GITHUB_TOKEN) {
  const githubSchema: CodegenConfig['schema'] = {
    'https://api.github.com/graphql': {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        // Hierarchy and issue fields each require their GraphQL schema feature.
        'GraphQL-Features': 'sub_issues,issue_fields',
      },
      // GitHub's live schema currently fails graphql-js's stricter
      // interface-deprecation-consistency validation (added in graphql v17).
      // Skip validation so introspection can still succeed.
      assumeValid: true,
    },
  };

  generates['src/renderer/utils/forges/github/graphql/generated/graphql.ts'] = {
    schema: githubSchema,
    documents: ['src/renderer/utils/forges/github/**/*.graphql'],
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
  };

  // Schema snapshot the GraphQL editor loads offline (see graphql.config.ts).
  generates['src/renderer/utils/forges/github/graphql/generated/schema.graphql'] = {
    schema: githubSchema,
    plugins: ['schema-ast'],
  };
} else {
  // oxlint-disable-next-line no-console -- CLI script output
  console.warn(
    '\x1b[33m⚠ GITHUB_TOKEN is not set. Skipping GitHub GraphQL codegen.\n' +
      '  To generate updated GitHub types, create a .env file with a valid GitHub PAT.\n' +
      '  See .env.template for details.\x1b[0m',
  );
}

const config: CodegenConfig = {
  overwrite: true,
  // Per-output schemas are declared on each `generates` entry, so no root schema is needed.
  documents: [],
  generates,
};

export default config;
