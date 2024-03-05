// import type ForgeConfig
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import type { ForgeConfig } from '@electron-forge/shared-types';

const Config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    osxSign: {
      identity: 'Emmanouil Konstantinidis (3YP8SXP3BF)',
      optionsForFile: () => ({
        hardenedRuntime: true,
        'gatekeeper-assess': false,
        entitlements: './entitlements/entitlements.mac.plist',
        'entitlements-inherit': './entitlements/entitlements.mac.plist',
        'signature-flags': 'library',
      }),
    },
    osxNotarize: {
      appleId: process.env.APPLEID_USERNAME!,
      appleIdPassword: process.env.APPLE_PASSWORD!,
      teamId: process.env.APPLE_TEAM_ID!,
    },
    appCategoryType: 'public.app-category.developer-tools',
    icon: 'assets/images/app-icon',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig: 'webpack.common.js',
      renderer: {
        config: './webpack.prod.js',
        entryPoints: [
          {
            name: 'Gitify',
            html: './src/renderer/index.html',
            js: './src/renderer/index.js',
          },
        ],
      },
    }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'gitify-app',
          name: 'gitify',
        },
        draft: true,
      },
    },
  ],
};

export default Config;
