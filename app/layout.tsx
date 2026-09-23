import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Layout from '@/components/layout/Layout';

export const metadata: Metadata = {
  metadataBase: new URL('https://vladcase.vercel.app'),
  title: {
    default: 'VLADCASE | CS2 Case Opening Simulator',
    template: '%s | VLADCASE',
  },
  description: 'A free local CS2-style case opening simulator with transparent catalog odds, local inventory, statistics, and virtual credits.',
  applicationName: 'VLADCASE',
  keywords: ['CS2 simulator', 'case opening simulator', 'skin inventory', 'virtual case simulator'],
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  openGraph: {
    type: 'website',
    title: 'VLADCASE | CS2 Case Opening Simulator',
    description: 'Explore illustrative cases, transparent simulator odds, and build a local virtual collection.',
    siteName: 'VLADCASE',
  },
  twitter: { card: 'summary_large_image', title: 'VLADCASE | CS2 Case Opening Simulator', description: 'A free local case-opening simulator.' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className="dark"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;900&display=swap" rel="stylesheet" /></head><body className="bg-background text-text-primary antialiased font-sans"><AppProvider><Layout>{children}</Layout></AppProvider></body></html>;
}
