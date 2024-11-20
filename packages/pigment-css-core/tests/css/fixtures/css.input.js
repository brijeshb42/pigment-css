// eslint-disable-next-line import/no-unresolved
import { css } from '@pigment-css/core';
import { t } from '@pigment-css/theme';

const ab = 'aliceblue';

export const cls1 = css`
  color: ${({ theme }) => theme.palette.primary.main};
  font-size: ${({ theme }) => theme.size.font.h1};
  background-color: ${ab};
`;

export const cls2 = css(
  {
    $$testVar: 'red',
    border: '1px solid $$testVar',
  },
  {
    $$testVar1: 'red',
    border: '1px solid $$testVar1',
  },
);

export const cls3 = css({
  className: 'Test-class',
})`
  color: ${({ theme }) => theme.palette.primary.main};
  font-size: ${({ theme }) => theme.size.font.h1};
  background-color: ${ab};
`;

export const cls4 = css({ className: 'Test-class2' }, [
  {
    $$testVar: 'red',
    backgroundColor: '$$testVar',
    border: `1px solid ${t('$palette.primary.main')}`,
  },
  ({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: theme.size.font.h1,
    backgroundColor: ab,
  }),
  ({ theme }) => `
    color: ${theme.palette.primary.main};
    font-size: ${theme.size.font.h1};
    background-color: ${ab};
  `,
  `
    color: red;
    font-size: 1rem;
    background-color: ${ab};
  `,
]);

export const cls5 = css(
  { className: 'Test-class3' },
  {
    $$testVar: 'red',
    backgroundColor: '$$testVar',
    border: `1px solid ${t('$palette.primary.main')}`,
  },
);
