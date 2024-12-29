import type { Metadata, Viewport } from 'next';
import '@pigment-css/react/theme';
import '@pigment-css/react/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: `%s · ${process.env.APP_NAME}`,
    default: process.env.APP_NAME,
  },
  twitter: {
    site: '@PigmentCSS',
    card: 'summary_large_image',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: {
      template: `%s · ${process.env.APP_NAME}`,
      default: process.env.APP_NAME,
    },
    ttl: 604800,
  },
  applicationName: process.env.APP_NAME,
  icons: {
    icon: [
      {
        url:
          process.env.NODE_ENV === 'production' ? '/static/favicon.ico' : '/static/favicon-dev.ico',
        sizes: '32x32',
      },
      {
        url:
          process.env.NODE_ENV === 'production' ? '/static/favicon.svg' : '/static/favicon-dev.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    shortcut: {
      url: '/static/apple-touch-icon.png',
      sizes: '180x180',
    },
    apple: {
      url: '/static/apple-touch-icon.png',
      sizes: '180x180',
    },
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
