import React from 'react';
import { Metadata } from 'next';
import { CategoryListingPage } from '@/components/post/CategoryListingPage';

export const metadata: Metadata = {
  title: 'Admit Card 2026 — Download Hall Tickets & Exam City',
  description: 'Download latest exam admit cards, hall tickets, exam city details, and call letters on LearnForRise.',
  alternates: {
    canonical: 'https://learnforrise.com/admit-card',
  },
  openGraph: {
    title: 'Admit Card 2026 | LearnForRise',
    description: 'Download latest exam admit cards, hall tickets, exam city details on LearnForRise.',
    url: 'https://learnforrise.com/admit-card',
    siteName: 'LearnForRise',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Admit Card 2026 | LearnForRise',
    description: 'Download latest exam admit cards & hall tickets.',
  },
};

export default function AdmitCardPage() {
  return <CategoryListingPage category="admit-card" />;
}
