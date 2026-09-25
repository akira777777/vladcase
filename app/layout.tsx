import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Layout from '@/components/layout/Layout';

export const metadata: Metadata = {
  metadataBase: new URL('https://vladcase.vercel.app'),
  title: {
    default: 'VLADCASE | CS2 Case Opening Platform',
    template: '%s | VLADCASE',
  },
  description: 'A premium CS2-style case opening simulator with transparent odds, local inventory, virtual economy, upgrader and contracts.',
  applicationName: 'VLADCASE',
  keywords: ['CS2 simulator', 'case opening simulator', 'skin inventory', 'virtual case simulator', 'case battles', 'upgrader', 'contracts'],
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  openGraph: {
    type: 'website',
    title: 'VLADCASE | CS2 Case Opening Platform',
    description: 'Premium CS2 case opening experience with transparent simulator odds and local inventory.',
    siteName: 'VLADCASE',
  },
  twitter: { card: 'summary_large_image', title: 'VLADCASE | CS2 Case Opening Platform', description: 'Premium CS2 case opening simulator.' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink-900 text-text-primary antialiased font-sans selection:bg-brand/40">
        <AppProvider>
          <Layout>{children}</Layout>
        </AppProvider>
      </body>
    </html>
  );
}
