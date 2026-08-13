import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import Script from 'next/script';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LearnForRise — Government Jobs, Results, Admit Cards & Syllabus',
    template: '%s | LearnForRise',
  },
  description:
    'Minimal, premium government job portal for Latest Jobs, Result, Admit Card, Syllabus, Answer Key, and Admission notifications across India. Fast and clutter-free.',
  keywords: [
    'sarkari result',
    'government jobs',
    'latest jobs',
    'admit card',
    'exam result',
    'syllabus',
    'answer key',
    'admission',
    'learnforrise',
  ],
  authors: [{ name: 'LearnForRise Team' }],
  metadataBase: new URL('https://learnforrise.com'),
  alternates: {
    canonical: 'https://learnforrise.com',
    types: {
      'application/rss+xml': 'https://learnforrise.com/feed.xml',
    },
    languages: {
      'en-IN': 'https://learnforrise.com',
      'hi-IN': 'https://learnforrise.com',
      'x-default': 'https://learnforrise.com',
    },
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  other: {
    'google-play-app': 'app-id=com.vinod.sarkarinaukri',
    'geo.region': 'IN',
    'geo.placename': 'India',
  },
  openGraph: {
    title: 'LearnForRise — Government Job & Result Information Portal',
    description: 'Clean, minimal, premium government job portal for Latest Jobs, Admit Card, Result & Syllabus.',
    url: 'https://learnforrise.com',
    siteName: 'LearnForRise',
    images: [{ url: '/logo.jpg', width: 500, height: 500, alt: 'LearnForRise Logo' }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LearnForRise',
    description: 'Minimal, premium government job portal.',
    images: ['/logo.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LearnForRise',
    url: 'https://learnforrise.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://learnforrise.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LearnForRise',
    url: 'https://learnforrise.com',
    logo: 'https://learnforrise.com/logo.jpg',
    sameAs: [
      'https://telegram.me/LearnForRiseExam_info',
      'https://whatsapp.com/channel/0029VaAbQf01NCrYADMLt00L',
      'https://play.google.com/store/apps/details?id=com.vinod.sarkarinaukri',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <head>
        <link rel="alternate" type="application/rss+xml" title="LearnForRise RSS Feed" href="/feed.xml" />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="antialiased selection:bg-[#0F9D6E] selection:text-white">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
