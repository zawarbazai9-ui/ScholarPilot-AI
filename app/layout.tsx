import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://scholarpilot.ai'),
  title: 'ScholarPilot AI — Discover scholarships, apply with confidence',
  description:
    'ScholarPilot AI helps students discover scholarships, assess eligibility with AI, save opportunities, and track applications — all in one place.',
  keywords: [
    'scholarships',
    'AI scholarship finder',
    'college funding',
    'student grants',
    'application tracking',
  ],
  authors: [{ name: 'ScholarPilot AI' }],
  openGraph: {
    title: 'ScholarPilot AI — Discover scholarships, apply with confidence',
    description:
      'Find the right scholarships, gauge your eligibility with AI, and track every application.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScholarPilot AI',
    description:
      'Find the right scholarships, gauge your eligibility with AI, and track every application.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
