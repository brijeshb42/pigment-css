import * as pigment from '@pigment-css/react';
import { css as css1 } from '@pigment-css/css';
import { css } from '@emotion/react';
import { color } from './color';

const a = css`
  color: red;
`;

const a1 = pigment.css`
  color: red;
  background-color: ${color};
`;

const a2 = css1('div')`
  color: red;
`;

const a3 = pigment.styled`
  color: red;
`;

const c = css({ color: 'red', backgroundColor: color.red });
const c1 = pigment.css({ color: 'red', backgroundColor: color.blue });
const c2 = css1({ color: 'red' });

console.log(a);
console.log(a1);
console.log(a2);
console.log(a3);
console.log(c);
console.log(c1);
console.log(c2);
