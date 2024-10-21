import css from '../src/css';

const cls1 = css({
  color: 'red',
  WebkitAlignContent: '-moz-initial',
});

declare module '@pigment-css/theme' {
  interface Theme {
    palette: {
      main: string;
    };
  }
}

const cls2 = css(({ theme }) => ({
  color: theme.palette.main,
  // @ts-expect-error main1 does not exists in theme.palette
  backgroundColor: theme.palette.main1,
}));

const cls3 = css`
  color: red;
  background-color: ${({ theme }) => theme.palette.main};
`;
