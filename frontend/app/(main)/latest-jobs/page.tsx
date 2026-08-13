import React from 'react';
import { Metadata } from 'next';
import { CategoryListingPage } from '@/components/post/CategoryListingPage';

export const metadata: Metadata = {
  title: 'Latest Government Jobs 2026 — Recruitment & Vacancies',
  description: 'Find latest sarkari vacancies, central & state government job notifications across India on LearnForRise.',
  alternates: {
    canonical: 'https://learnforrise.com/latest-jobs',
  },
  openGraph: {
    title: 'Latest Government Jobs 2026 | LearnForRise',
    description: 'Find latest sarkari vacancies, central & state government job notifications across India.',
    url: 'https://learnforrise.com/latest-jobs',
    siteName: 'LearnForRise',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latest Government Jobs 2026 | LearnForRise',
    description: 'Find latest sarkari vacancies across India.',
  },
};

export default function LatestJobsPage() {
  return <CategoryListingPage category="latest-jobs" />;
}
