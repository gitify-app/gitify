import { EnvironmentPlugin } from 'webpack';

export const plugins = [
  new EnvironmentPlugin({
    // Development Keys - See README.md
    OAUTH_CLIENT_ID: '3fef4433a29c6ad8f22c',
    OAUTH_CLIENT_SECRET: '9670de733096c15322183ff17ed0fc8704050379',
  }),
];
