import React from 'react';
import { Metadata } from 'next';
import { PostDetailPageView } from '@/components/post/PostDetailPageView';
import { generateCategoryPostMetadata, generateCategoryPostParams, getPostSSRData } from '@/lib/seo';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return generateCategoryPostParams('latest-jobs');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateCategoryPostMetadata(slug, 'latest-jobs', 'Notification & Apply Online');
}

export default async function LatestJobDetailPage({ params }: PageProps) {
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
