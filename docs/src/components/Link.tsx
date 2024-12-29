import * as React from 'react';
import clsx from 'clsx';
import NextLink from 'next/link';
import { css } from '@pigment-css/react';

const baseStyle = css`
  color: #0073e6;
`;

const styleWithIcon = css`
  margin-right: 0.125rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

export function Link({ href, className, ...props }: React.ComponentProps<typeof NextLink>) {
  // Sometimes link come from component descriptions; in this case, remove the domain
  if (typeof href === 'string' && href.startsWith('https://pigment-css.com')) {
    href = href.replace('https://pigment-css.com', '');
  }

  if (typeof href === 'string' && href.startsWith('http')) {
    return (
      <NextLink
        href={href}
        target="_blank"
        rel="noopener"
        {...props}
        className={clsx('Link', baseStyle, styleWithIcon, className)}
      >
        {props.children}
      </NextLink>
    );
  }

  return <NextLink href={href} className={clsx('Link', baseStyle, className)} {...props} />;
}
