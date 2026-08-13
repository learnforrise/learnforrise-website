'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { Post } from '@/types/post';
import { getPostBySlug, getRelatedPosts } from '@/lib/api';
import { PostDetail } from './PostDetail';
import { RelatedPosts } from './RelatedPosts';
import { DetailSkeleton } from '../ui/Skeleton';
import { getCategoryDisplayName } from '@/lib/utils';

interface PostDetailPageViewProps {
  slug: string;
  initialPost?: Post | null;
  initialRelated?: Post[];
}

export function PostDetailPageView({ slug, initialPost, initialRelated = [] }: PostDetailPageViewProps) {
  const [post, setPost] = useState<Post | null>(initialPost || null);
  const [related, setRelated] = useState<Post[]>(initialRelated);
  const [loading, setLoading] = useState(!initialPost);

  useEffect(() => {
    let isMounted = true;
    async function loadPostData() {
      if (!initialPost) {
        setLoading(true);
        try {
          const [postRes, relatedRes] = await Promise.all([
            getPostBySlug(slug),
            getRelatedPosts(slug),
          ]);

          if (isMounted) {
            if (postRes.success && postRes.data) setPost(postRes.data);
            if (relatedRes.success && relatedRes.data) setRelated(relatedRes.data);
          }
        } catch (err) {
          console.error('Error fetching post:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    }

    loadPostData();
    return () => {
      isMounted = false;
    };
  }, [slug, initialPost]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="font-heading font-bold text-2xl text-[var(--text-main)]">
          Post Not Found
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          The requested job or notification could not be found or has been removed.
        </p>
      </div>
    );
  }

  const categoryLabel = getCategoryDisplayName(post.category);
  const postUrl = `https://learnforrise.com/${post.category}/${post.slug}`;

  // BreadcrumbList JSON-LD for Search Engine Rich Snippets
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://learnforrise.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryLabel,
        item: `https://learnforrise.com/${post.category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  // FAQPage JSON-LD for AEO (Answer Engine Optimization & Voice Assistants)
  const faqItems = [
    {
      '@type': 'Question',
      name: `What is the title of this notification?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: post.title,
      },
    },
  ];

  if (post.totalPosts) {
    faqItems.push({
      '@type': 'Question',
      name: `How many posts are available in ${post.title}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `There are ${post.totalPosts} total vacancies announced.`,
      },
    });
  }

  if (post.qualification) {
    faqItems.push({
      '@type': 'Question',
      name: `What is the eligibility qualification for ${post.title}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: post.qualification,
      },
    });
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  };

  // Article / NewsArticle Structured Data JSON-LD for SEO & Search Engine Ranking
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.shortDescription || post.title,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LearnForRise',
      url: 'https://learnforrise.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://learnforrise.com/logo.jpg',
      },
    },
    author: {
      '@type': 'Organization',
      name: 'LearnForRise Team',
    },
  };

  // JobPosting Structured Data for latest-jobs
  const jobJsonLd = post.category === 'latest-jobs' ? {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: post.title,
    description: post.shortDescription || post.title,
    datePosted: post.publishedAt || post.createdAt,
    validThrough: post.importantDates?.[0]?.date,
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: post.department || 'Government of India',
      sameAs: 'https://learnforrise.com',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
        addressRegion: post.state || 'India',
      },
    },
  } : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {jobJsonLd && (
        <Script
          id="job-posting-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}
        />
      )}

      <PostDetail post={post} />
      <RelatedPosts posts={related} />
    </div>
  );
}
