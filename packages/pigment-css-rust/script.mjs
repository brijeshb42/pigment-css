import * as fs from 'node:fs';

import { transform } from './index.js';

const code = fs.readFileSync('./test.mjs', 'utf-8');

const result = transform(code, 'test.mjs');

console.log(result.code);
console.log('--------------------------------');
console.log(result.codeToEvaluate);
