import * as url from 'url';
import * as path from 'path';
import type { NextConfig } from 'next';
// @ts-ignore
// eslint-disable-next-line no-restricted-imports
import withDocsInfra from '@mui/monorepo/docs/nextConfigDocsInfra.js';
import { withPigment, extendTheme } from '@pigment-css/nextjs-plugin';

import { theme as baseTheme } from './src/theme';
import rootPackage from '../package.json';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));
const DATA_DIR = path.join(currentDirectory, 'data');

const nextConfig: NextConfig = {
  trailingSlash: false,
  pageExtensions: ['mdx', 'tsx'],
  env: {
    DATA_DIR,
    CURRENT_VERSION: rootPackage.version,
    APP_NAME: 'Pigment CSS',
    APP_DESC: rootPackage.description,
  },
  ...(process.env.NODE_ENV === 'production' && { distDir: 'export', output: 'export' }),
  devIndicators: {
    appIsrStatus: false,
  },
  experimental: {
    esmExternals: true,
    workerThreads: false,
    turbo: undefined,
  },
};

const theme = extendTheme({
  colorSchemes: {
    light: baseTheme,
  },
});

const docsConfig = withDocsInfra(nextConfig);
const { optimizeFonts, ...result } = docsConfig;

export default withPigment(result, {
  theme,
  displayName: true,
  sourceMap: process.env.NODE_ENV !== 'production',
  babelOptions: {
    plugins: [
      '@babel/plugin-proposal-explicit-resource-management',
      '@babel/plugin-transform-unicode-property-regex',
    ],
  },
});
