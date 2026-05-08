import type { CodegenConfig } from '@graphql-codegen/cli';
import dotenv from 'dotenv';

dotenv.config();

const githubConfig: CodegenConfig['generates'][string] | null = process.env
  .GITHUB_TOKEN
  ? {
      plugins: ['typescript-operations', 'typed-document-node'],
      config: {
        documentMode: 'string',
        scalars: {
          DateTime: 'string',
          URI: '../../../../../types#Link',
        },
        useTypeImports: true,
      },
    }
  : null;

if (!githubConfig) {
  // biome-ignore lint/suspicious/noConsole: CLI script output
  console.warn(
    '\x1b[33m⚠ GITHUB_TOKEN is not set. Skipping GitHub GraphQL codegen.\n' +
      '  To generate updated GitHub types, create a .env file with a valid GitHub PAT.\n' +
      '  See .env.template for details.\x1b[0m',
  );
}

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    ...(githubConfig
      ? {
          'src/renderer/utils/forges/github/graphql/generated/graphql.ts': {
            schema: {
              'https://api.github.com/graphql': {
                headers: {
                  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                },
              },
            },
            documents: ['src/renderer/utils/forges/github/**/*.graphql'],
            ...githubConfig,
          },
        }
      : {}),
    'src/renderer/utils/forges/bitbucket/graphql/generated/graphql.ts': {
      schema: 'https://developer.atlassian.com/gateway/api/graphql',
      documents: ['src/renderer/utils/forges/bitbucket/**/*.graphql'],
      plugins: ['typescript-operations', 'typed-document-node'],
      config: {
        documentMode: 'string',
        enumType: 'native',
        scalars: {
          DateTime: 'string',
          URL: '../../../../../types#Link',
        },
        useTypeImports: true,
      },
    },
  },
};

export default config;
