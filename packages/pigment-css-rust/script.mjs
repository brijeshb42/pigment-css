import * as fs from 'node:fs';

import { transform } from './index.js';

const code = fs.readFileSync('./test.mjs', 'utf-8');

console.log(transform(code, 'test.mjs').code);
