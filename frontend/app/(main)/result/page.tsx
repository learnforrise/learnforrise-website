import React from 'react';
import { Metadata } from 'next';
import { CategoryListingPage } from '@/components/post/CategoryListingPage';

export const metadata: Metadata = {
  title: 'Sarkari Result 2026 — Check Exam Results & Merit Lists',
  description: 'Check latest exam results, merit lists, score cards, and cut-off marks for competitive exams on LearnForRise.',
  alternates: {
    canonical: 'https://learnforrise.com/result',
  },
  openGraph: {
    title: 'Sarkari Result 2026 | LearnForRise',
    description: 'Check latest exam results, merit lists, score cards, and cut-off marks on LearnForRise.',
    url: 'https://learnforrise.com/result',
    siteName: 'LearnForRise',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sarkari Result 2026 | LearnForRise',
    description: 'Check latest exam results & merit lists.',
  },
};

export default function ResultPage() {
  return <CategoryListingPage category="result" />;
}
