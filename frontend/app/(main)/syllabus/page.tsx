import React from 'react';
import { Metadata } from 'next';
import { CategoryListingPage } from '@/components/post/CategoryListingPage';

export const metadata: Metadata = {
  title: 'Exam Syllabus & Pattern 2026 — Download PDF',
  description: 'Download latest exam syllabus PDF, selection process, and subject-wise exam patterns on LearnForRise.',
  alternates: {
    canonical: 'https://learnforrise.com/syllabus',
  },
  openGraph: {
    title: 'Exam Syllabus & Pattern 2026 | LearnForRise',
    description: 'Download latest exam syllabus PDF and subject-wise exam patterns on LearnForRise.',
    url: 'https://learnforrise.com/syllabus',
    siteName: 'LearnForRise',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Exam Syllabus & Pattern 2026 | LearnForRise',
    description: 'Download latest exam syllabus PDF & exam patterns.',
  },
};

export default function SyllabusPage() {
  return <CategoryListingPage category="syllabus" />;
}
