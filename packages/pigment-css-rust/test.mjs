import * as pigment from '@pigment-css/react';
import { css as css1 } from '@pigment-css/css';
import { css } from '@emotion/react';

const a = css`
  color: red;
`;

const a1 = pigment.css`
  color: red;
`;

const a2 = css1`
  color: red;
`;

const a3 = pigment.styled`
  color: red;
`;

const c = css({ color: 'red' });
const c1 = pigment.css({ color: 'red' });
const c2 = css1({ color: 'red' });

console.log(a);
console.log(a1);
console.log(a2);
console.log(a3);
console.log(c);
console.log(c1);
console.log(c2);
