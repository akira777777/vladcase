import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Layout from '@/components/layout/Layout';

export const metadata: Metadata = {
  title: 'VLADCASE | CS2 Case Opening Simulator',
  description: 'Experience authentic CS2 case openings, build your weapon inventory, and trade rare skins.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-text-primary antialiased font-sans">
        <AppProvider>
          <Layout>{children}</Layout>
        </AppProvider>
      </body>
    </html>
  );
}
