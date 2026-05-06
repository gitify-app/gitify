import type { CodegenConfig } from '@graphql-codegen/cli';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GITHUB_TOKEN) {
  // biome-ignore lint/suspicious/noConsole: CLI script output
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
      },
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
