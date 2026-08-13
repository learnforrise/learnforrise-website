import React from 'react';
import { Metadata } from 'next';
import { CategoryListingPage } from '@/components/post/CategoryListingPage';

export const metadata: Metadata = {
  title: 'Admission & Counselling 2026 — Forms & Notifications',
  description: 'Find latest university admissions, entrance exam forms, counselling schedules, and allotment results on LearnForRise.',
  alternates: {
    canonical: 'https://learnforrise.com/admission',
  },
  openGraph: {
    title: 'Admission & Counselling 2026 | LearnForRise',
    description: 'Find latest university admissions, entrance exam forms, and counselling schedules on LearnForRise.',
    url: 'https://learnforrise.com/admission',
    siteName: 'LearnForRise',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Admission & Counselling 2026 | LearnForRise',
    description: 'Find latest university admissions & entrance exam forms.',
  },
};

export default function AdmissionPage() {
  return <CategoryListingPage category="admission" />;
}
