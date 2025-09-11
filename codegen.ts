import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://docs.github.com/public/fpt/schema.docs.graphql',
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
    // 'src/renderer/utils/api/graphql/generated/schema.graphql': {
    //   plugins: ['schema-ast'],
    //   config: {
    //     includeDirectives: true,
    //   },
    // },
  },
};

export default config;
