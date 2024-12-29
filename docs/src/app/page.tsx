import * as React from 'react';
import type { Metadata, Viewport } from 'next';
import { styled } from '@pigment-css/react';
import { Link } from '@/components/Link';

const Page = styled.div`
  display: grid;
  grid-template-rows: 20px 1fr 20px;
  place-items: center center;
  min-height: 100svh;
  padding: 80px;
  gap: 64px;
  font-family: var(--font-geist-sans);

  @media (prefers-color-scheme: dark) {
    & {
      --gray-rgb: 255, 255, 255;
      --gray-alpha-200: rgb(var(--gray-rgb) 0.145);
      --gray-alpha-100: rgb(var(--gray-rgb) 0.06);
      --button-primary-hover: #ccc;
      --button-secondary-hover: #1a1a1a;
    }
  }

  @media (max-width: 600px) {
    & {
      padding: 32px;
      padding-bottom: 80px;
    }
  }
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  gap: 32px;
  grid-row-start: 2;

  & ol {
    font-family: var(--font-geist-mono);
    padding-left: 0;
    margin: 0;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: -0.01em;
    list-style-position: inside;
  }

  & li:not(:last-of-type) {
    margin-bottom: 8px;
  }

  & code {
    font-family: inherit;
    background: var(--gray-alpha-100);
    padding: 2px 4px;
    border-radius: 4px;
    font-weight: 600;
  }

  @media (max-width: 600px) {
    align-items: center;

    & ol {
      text-align: center;
    }
  }
`;

export default function Home() {
  return (
    <Page>
      <Main>
        <img
          alt={process.env.APP_NAME}
          width={25}
          src="/static/logo.svg"
          className="mb-8 ml-px"
          aria-label={process.env.APP_NAME}
        />
        <h1 className="HomepageHeading">{process.env.APP_DESC}</h1>
        <Link href="/getting-started/overview">Documentation</Link>
      </Main>
    </Page>
  );
}

const description = process.env.APP_DESC;

export const metadata: Metadata = {
  description,
  twitter: {
    description,
  },
  openGraph: {
    description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    // Desktop Safari page background
    {
      media: '(prefers-color-scheme: light) and (min-width: 1024px)',
      color: 'oklch(95% 0.25% 264)',
    },
    {
      media: '(prefers-color-scheme: dark) and (min-width: 1024px)',
      color: 'oklch(25% 1% 264)',
    },

    // Mobile Safari header background (match the page)
    {
      media: '(prefers-color-scheme: light)',
      color: '#FFF',
    },
    {
      media: '(prefers-color-scheme: dark)',
      color: '#000',
    },
  ],
};
