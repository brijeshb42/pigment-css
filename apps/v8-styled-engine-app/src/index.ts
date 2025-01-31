// @ts-expect-error
import { styled, css } from '@my-lib/styled';

export const Hello = styled.div`
  background: red;
  color: var(--color-text-primary);

  .primary {
    background: blue;
  }

  @media (md) {
    color: blue;
  }

  @media (width >= 40rem) {
    color: red;
  }
`;

export const Hello2 = styled.div`
  background: red;
  color: var(--color-text-primary);

  .primary {
    background: blue;
  }
`;

export const WrappedHello = styled(Hello)`
  color: red;
`;

// implicit :scope, we can make it optional for simpler styles
export const someSx = css`
  color: blue;

  @media (max-width: 600px) {
    color: gray;
  }
`;

export const temp = css`
  color: red;
`;

export const Div = styled.div`
  color: var(--red);
  & .nested {
    color: var(--green);
  }
`;
