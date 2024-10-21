import { Options, defineConfig } from 'tsup';
import config from '../../tsup.config';

// const processors = ['keyframes', 'generateAtomics', 'css', 'globalCss'];

const baseConfig: Options = {
  ...(config as Options),
  tsconfig: './tsconfig.build.json',
};

const BASE_FILES = ['index.ts'];

export default defineConfig([
  {
    ...baseConfig,
    entry: BASE_FILES.map((file) => `./src/${file}`),
  },
  // {
  //   ...baseConfig,
  //   entry: processors.map((file) => `./src/processors/${file}.ts`),
  //   outDir: 'processors',
  // },
]);
