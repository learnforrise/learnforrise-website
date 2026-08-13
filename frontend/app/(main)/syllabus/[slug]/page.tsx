import React from 'react';
import { Metadata } from 'next';
import { PostDetailPageView } from '@/components/post/PostDetailPageView';
import { generateCategoryPostMetadata, generateCategoryPostParams, getPostSSRData } from '@/lib/seo';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return generateCategoryPostParams('syllabus');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateCategoryPostMetadata(slug, 'syllabus', 'Syllabus & Exam Pattern');
}

export default async function SyllabusDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { initialPost, initialRelated } = await getPostSSRData(slug);

  return (
    <PostDetailPageView
      slug={slug}
      initialPost={initialPost}
      initialRelated={initialRelated}
    />
  );
}
