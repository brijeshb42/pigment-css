import { transform } from './index.js';

console.log(
  transform(
    `
import { css } from 'pigment-css';

const a = css\`
  color: red;
\`;

console.log(a);
`,
    'test.js',
  ),
);
