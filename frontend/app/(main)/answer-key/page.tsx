import React from 'react';
import { Metadata } from 'next';
import { CategoryListingPage } from '@/components/post/CategoryListingPage';

export const metadata: Metadata = {
  title: 'Answer Key 2026 — Official Keys & Response Sheets',
  description: 'Download official exam answer keys, response sheets, and objection submission links on LearnForRise.',
  alternates: {
    canonical: 'https://learnforrise.com/answer-key',
  },
  openGraph: {
    title: 'Answer Key 2026 | LearnForRise',
    description: 'Download official exam answer keys and response sheets on LearnForRise.',
    url: 'https://learnforrise.com/answer-key',
    siteName: 'LearnForRise',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Answer Key 2026 | LearnForRise',
    description: 'Download official exam answer keys & response sheets.',
  },
};

export default function AnswerKeyPage() {
  return <CategoryListingPage category="answer-key" />;
}
